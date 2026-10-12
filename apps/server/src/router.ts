import { ERROR_CODES } from "@livrelibre/shared/errors";
import { TVAValues, zItem, zItemType } from "@livrelibre/shared/item";
import { zOrder, zOrderSort, zOrderStatusArray } from "@livrelibre/shared/order";
import { CART_ITEM_KINDS } from "@livrelibre/shared/sale";
import { norm } from "@livrelibre/shared/utils";
import {
  zDateISO,
  zId,
  zIsbn,
  zPage,
  zPassword,
  zPrice,
  zQuantity,
} from "@livrelibre/shared/validation";
import { addItem } from "@server/server/addItem";
import { getBestSales } from "@server/server/bestSales";
import { getBookmarks, starItem } from "@server/server/bookmarks";
import {
  addISBNToCart,
  addNewItemToCart,
  addToCart,
  getAsideCart,
  getCart,
  payCart,
  putCartAside,
  reactivateCart,
  removeFromCart,
} from "@server/server/cart";
import {
  customerExistsByNmFullname,
  deleteCustomer,
  getCustomer,
  getCustomers,
  getSelectedCustomer,
  newCustomer,
  searchCustomers,
  setCustomer,
  setSelectedCustomer,
} from "@server/server/customers";
import {
  createItemType,
  deleteItemType,
  getItemTypes,
  itemTypeExists,
  updateItemType,
} from "@server/server/itemTypes";
import { lastSales } from "@server/server/lastSales";
import {
  deleteOrder,
  getCustomerActiveOrders,
  getItemOrders,
  getOrder,
  getOrders,
  newOrder,
  setCustomerNotified,
  setOrder,
} from "@server/server/orders";
import { getSales } from "@server/server/sales";
import { deleteSale, getSalesByDay } from "@server/server/salesByDay";
import { getSalesByMonth } from "@server/server/salesByMonth";
import {
  type AdvancedSearchField,
  advancedSearch,
  getItem,
  getItems,
  isAdvancedSearchField,
  searchItems,
} from "@server/server/searchItem";
import { getStats } from "@server/server/stats";
import { updateItem } from "@server/server/updateItem";
import {
  changePassword,
  createUser,
  deleteUser,
  getUsers,
  resetUserPassword,
  updateUser,
} from "@server/server/users";
import { logger } from "@server/utils/logger";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { middleware, procedure, router } from "./trpc";

const payCartSchema = z.object({
  paymentDate: zDateISO,
  paymentType: z.enum(["cash", "card", "check", "check-lire", "transfer"]),
});

type AdvancedSearchValueRule = { isValid: (value: string) => boolean; message: string };

const ADVANCED_SEARCH_VALUE_RULES: Partial<Record<AdvancedSearchField, AdvancedSearchValueRule>> = {
  tva: {
    isValid: (value) => z.enum(TVAValues).safeParse(value).success,
    message: ERROR_CODES.INVALID_TVA,
  },
  datebought: {
    isValid: (value) => zDateISO.safeParse(value).success,
    message: ERROR_CODES.INVALID_DATE,
  },
  isbn: {
    isValid: (value) => zIsbn.safeParse(value).success,
    message: ERROR_CODES.INVALID_ISBN,
  },
  price: {
    isValid: (value) => /^-?\d+([.,]\d+)?$/.test(value),
    message: ERROR_CODES.INVALID_NUMBER,
  },
  amount: {
    isValid: (value) => /^\d+([.,]\d+)?$/.test(value),
    message: ERROR_CODES.INVALID_NUMBER,
  },
};

const checkAuth = middleware(({ ctx, next }) => {
  if (ctx.user.role === "anonymous") {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next();
});

const authProcedure = procedure.use(checkAuth);

const adminProcedure = authProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next();
});

export const appRouter = router({
  // Queries
  advancedSearch: authProcedure
    .input(
      z
        .object({ search: z.record(z.string(), z.string()), page: zPage })
        .superRefine(({ search }, ctx) => {
          for (const [key, value] of Object.entries(search)) {
            if (!isAdvancedSearchField(key)) {
              ctx.addIssue({
                code: "custom",
                message: ERROR_CODES.INVALID_SEARCH_FIELD,
                path: ["search", key],
              });
              continue;
            }
            if (value === "") continue;
            const rule = ADVANCED_SEARCH_VALUE_RULES[key];
            if (rule && !rule.isValid(value)) {
              ctx.addIssue({
                code: "custom",
                message: rule.message,
                path: ["search", key],
              });
            }
          }
        }),
    )
    .query(async ({ input }) => {
      const type = input.search.type;
      if (type && !(await itemTypeExists(type))) {
        throw new TRPCError({ code: "BAD_REQUEST", message: ERROR_CODES.INVALID_TYPE });
      }
      return await advancedSearch(input.search, input.page);
    }),
  asideCart: authProcedure.query(async ({ ctx }) => await getAsideCart(ctx.user.id)),
  bestsales: authProcedure.query(getBestSales),
  bookmarks: authProcedure.query(getBookmarks),
  cart: authProcedure.query(async ({ ctx }) => await getCart(ctx.user.id)),
  items: authProcedure
    .input(zPage)
    .query(async ({ input }) => await getItems({ pageNumber: input })),
  itemTypes: authProcedure.query(getItemTypes),
  customer: authProcedure.input(zId).query(async ({ input }) => await getCustomer(input)),
  customers: authProcedure
    .input(
      z.object({
        pageNumber: zPage,
        fullname: z.string().optional(),
        withPurchases: z.boolean().default(false),
      }),
    )
    .query(async ({ input }) => await getCustomers(input)),
  searchCustomer: authProcedure
    .input(z.string())
    .query(async ({ input }) => await searchCustomers(input)),
  selectedCustomer: authProcedure.query(async ({ ctx }) => {
    const customer = await getSelectedCustomer(ctx.user.id, false);
    return customer?.customerId ? await getCustomer(customer.customerId) : null;
  }),
  order: authProcedure.input(zId).query(async ({ input }) => await getOrder(input)),
  itemOrders: authProcedure.input(zId).query(async ({ input }) => await getItemOrders(input)),
  orders: authProcedure
    .input(
      z.object({
        statuses: zOrderStatusArray,
        page: zPage.default(1),
        grouped: z.boolean().default(true),
        search: z.string().default(""),
        sortBy: zOrderSort.default("dateDesc"),
      }),
    )
    .query(
      async ({ input }) =>
        await getOrders({
          statuses: input.statuses,
          pageNumber: input.page,
          grouped: input.grouped,
          search: input.search,
          sortBy: input.sortBy,
        }),
    ),
  customerOrders: authProcedure
    .input(zId)
    .query(async ({ input }) => await getCustomerActiveOrders(input)),
  lastSales: authProcedure.input(zId).query(async ({ input }) => await lastSales(input)),
  quicksearch: authProcedure
    .input(
      z.object({
        search: z.string(),
        page: zPage.default(1),
        inStock: z.boolean().default(false),
      }),
    )
    .query(async ({ input }) => await searchItems(input)),
  sales: adminProcedure.query(getSales),
  salesByDay: authProcedure
    .input(zDateISO)
    .query(async ({ ctx, input }) =>
      getSalesByDay(input, { restrictToToday: ctx.user.role !== "admin" }),
    ),
  salesByMonth: adminProcedure
    .input(
      z.object({
        month: z.string().regex(/^(0[1-9]|1[0-2])$/),
        year: z.string().regex(/^\d{4}$/),
      }),
    )
    .query(async ({ input }) => await getSalesByMonth(input.month, input.year)),
  searchItem: authProcedure.input(zId).query(async ({ input }) => await getItem(input)),
  stats: authProcedure.query(getStats),
  user: procedure.query(({ ctx }) => ctx.user),
  isbnSearch: authProcedure
    .input(
      // Barcode scanners sometimes read extra digits; keep the first 13.
      z
        .string()
        .regex(/^\d{10,}$/, ERROR_CODES.INVALID_ISBN)
        .transform((value) => value.slice(0, 13)),
    )
    .query(async ({ input }) => {
      return await searchItems({ search: input });
    }),
  // Mutations
  addISBNToCart: authProcedure
    .input(z.string().regex(/^\d{10,13}$/))
    .mutation(async ({ input, ctx }) => {
      logger.info("Quick add to cart", { user: ctx.user, isbn: input });
      return await addISBNToCart(ctx.user.id, input);
    }),
  addItem: authProcedure.input(zItem).mutation(async ({ ctx, input }) => {
    if (!(await itemTypeExists(input.type))) {
      throw new TRPCError({ code: "BAD_REQUEST", message: ERROR_CODES.INVALID_ITEM_TYPE });
    }
    logger.info("Add new item", { user: ctx.user, isbn: input.isbn });
    return await addItem(input);
  }),
  addNewItemToCart: authProcedure
    .input(
      z.object({
        price: zPrice,
        title: z.string(),
        tva: z.enum(TVAValues),
        type: zItemType,
        kind: z.enum(CART_ITEM_KINDS).default("standalone"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!(await itemTypeExists(input.type))) {
        throw new TRPCError({ code: "BAD_REQUEST", message: ERROR_CODES.INVALID_ITEM_TYPE });
      }
      await addNewItemToCart(ctx.user.id, input);
    }),
  addToCart: authProcedure
    .input(z.object({ id: zId, quantity: zQuantity.optional() }))
    .mutation(async ({ input, ctx }) => {
      logger.info("Add to cart", {
        user: ctx.user,
        itemId: input.id,
        quantity: input.quantity,
      });
      await addToCart(ctx.user.id, input.id, input.quantity);
    }),
  deleteSale: authProcedure
    .input(
      z.object({
        saleId: zId,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      logger.info("Delete sale", { user: ctx.user, saleId: input.saleId });
      await deleteSale(input.saleId, ctx.user, { restrictToToday: ctx.user.role !== "admin" });
    }),
  deleteCustomer: authProcedure.input(z.object({ id: zId })).mutation(async ({ ctx, input }) => {
    logger.info("Delete customer", { user: ctx.user, customerId: input.id });
    return await deleteCustomer(input.id);
  }),
  updateCustomer: authProcedure
    .input(
      z.object({
        customerId: zId.optional(),
        customer: z.object({
          fullname: z.string().trim().min(1, ERROR_CODES.INVALID_NAME),
          phone: z.string().nullable(),
          email: z.string().nullable(),
          contact: z.string(),
          comment: z.string(),
        }),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const nmFullname = norm(input.customer.fullname);
      const duplicate = await customerExistsByNmFullname(nmFullname, input.customerId);
      if (duplicate) {
        throw new TRPCError({
          code: "CONFLICT",
          message: ERROR_CODES.CUSTOMER_ALREADY_EXISTS,
        });
      }
      const customer = {
        ...input.customer,
        phone: input.customer.phone ?? null,
        email: input.customer.email ?? null,
        nmFullname,
      };
      if (input.customerId) {
        logger.info("Update customer", {
          user: ctx.user,
          customerId: input.customerId,
        });
        return await setCustomer(customer, input.customerId);
      } else {
        logger.info("New customer", { user: ctx.user });
        return await newCustomer(customer);
      }
    }),
  payCart: authProcedure.input(payCartSchema).mutation(async ({ input, ctx }) => {
    logger.info("Pay cart", { user: ctx.user, paymentType: input.paymentType });
    return await payCart(ctx.user.id, input);
  }),
  putCartAside: authProcedure.mutation(async ({ ctx }) => {
    await putCartAside(ctx.user.id);
  }),
  reactivateCart: authProcedure.mutation(async ({ ctx }) => {
    await reactivateCart(ctx.user.id);
  }),
  removeFromCart: authProcedure.input(zId).mutation(async ({ ctx, input }) => {
    logger.info("Remove from cart", { user: ctx.user, cartItemId: input });
    await removeFromCart(ctx.user.id, input);
  }),
  star: authProcedure
    .input(z.object({ id: zId, starred: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      logger.info("Star item", {
        user: ctx.user,
        itemId: input.id,
        starred: input.starred,
      });
      return await starItem(input.id, input.starred);
    }),
  updateItem: authProcedure
    .input(z.object({ item: zItem, id: zId }))
    .mutation(async ({ ctx, input }) => {
      if (!(await itemTypeExists(input.item.type))) {
        throw new TRPCError({ code: "BAD_REQUEST", message: ERROR_CODES.INVALID_ITEM_TYPE });
      }
      logger.info("Update item", { user: ctx.user, itemId: input.id });
      return await updateItem(input.item, input.id);
    }),
  selectCustomer: authProcedure
    .input(
      z.object({
        customerId: zId.nullable(),
        asideCart: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      logger.info("Select customer", {
        user: ctx.user,
        customerId: input.customerId,
      });
      return await setSelectedCustomer({ ...input, userId: ctx.user.id });
    }),
  newOrder: authProcedure.input(zOrder).mutation(async ({ ctx, input }) => {
    logger.info("New order", {
      user: ctx.user,
      customerId: input.customerId,
      itemId: input.itemId,
    });
    return await newOrder(input, ctx.user);
  }),
  updateOrder: authProcedure
    .input(
      z.object({
        order: zOrder,
        id: zId,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      logger.info("Update order", { user: ctx.user, orderId: input.id });
      return await setOrder(input.order, input.id, ctx.user);
    }),
  setCustomerNotified: authProcedure
    .input(
      z.object({
        orderId: zId,
        customerNotified: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      logger.info("Set customer notified", { user: ctx.user, ...input });
      return await setCustomerNotified(input.orderId, input.customerNotified);
    }),
  deleteOrder: authProcedure.input(z.object({ id: zId })).mutation(async ({ ctx, input }) => {
    logger.info("Delete order", { user: ctx.user, orderId: input.id });
    return await deleteOrder(input.id, ctx.user);
  }),
  changePassword: authProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: zPassword,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await changePassword(ctx.user.id, input.currentPassword, input.newPassword);
      logger.info("Password changed", { user: ctx.user });
    }),
  users: adminProcedure.query(getUsers),
  createUser: adminProcedure
    .input(
      z.object({
        name: z.string().trim().min(1, ERROR_CODES.INVALID_NAME),
        password: zPassword,
        role: z.enum(["admin", "cashier"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await createUser(input.name, input.password, input.role);
      logger.info("User created", { user: ctx.user, name: input.name, role: input.role });
    }),
  updateUser: adminProcedure
    .input(
      z.object({
        id: zId,
        name: z.string().trim().min(1, ERROR_CODES.INVALID_NAME),
        role: z.enum(["admin", "cashier"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await updateUser(input.id, input.name, input.role);
      logger.info("User updated", { user: ctx.user, userId: input.id, role: input.role });
    }),
  resetUserPassword: adminProcedure
    .input(z.object({ id: zId, password: zPassword }))
    .mutation(async ({ ctx, input }) => {
      await resetUserPassword(input.id, input.password);
      logger.info("User password reset", { user: ctx.user, userId: input.id });
    }),
  deleteUser: adminProcedure.input(zId).mutation(async ({ ctx, input }) => {
    await deleteUser(input, ctx.user.id);
    logger.info("User deleted", { user: ctx.user, userId: input });
  }),
  createItemType: adminProcedure
    .input(
      z.object({
        code: zItemType,
        label: z.string().trim().min(1, ERROR_CODES.INVALID_NAME),
        position: z.number().int().nonnegative().optional(),
        active: z.boolean().optional(),
        isDefault: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await createItemType(input);
      logger.info("Item type created", { user: ctx.user, code: input.code });
    }),
  updateItemType: adminProcedure
    .input(
      z.object({
        code: zItemType,
        label: z.string().trim().min(1, ERROR_CODES.INVALID_NAME).optional(),
        position: z.number().int().nonnegative().optional(),
        active: z.boolean().optional(),
        isDefault: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { code, ...rest } = input;
      await updateItemType(code, rest);
      logger.info("Item type updated", { user: ctx.user, code });
    }),
  deleteItemType: adminProcedure.input(zItemType).mutation(async ({ ctx, input }) => {
    await deleteItemType(input);
    logger.info("Item type deleted", { user: ctx.user, code: input });
  }),
});

export type AppRouter = typeof appRouter;
