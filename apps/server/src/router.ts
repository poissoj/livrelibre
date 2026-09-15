import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { ItemTypes, TVAValues } from "@livrelibre/shared/item";
import { zOrder, zOrderStatusArray } from "@livrelibre/shared/order";
import { norm } from "@livrelibre/shared/utils";

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
  deleteCustomer,
  getCustomer,
  getCustomers,
  getSelectedCustomer,
  newCustomer,
  searchCustomers,
  setCustomer,
  setSelectedCustomer,
} from "@server/server/customers";
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
  advancedSearch,
  getItem,
  getItems,
  searchItems,
} from "@server/server/searchItem";
import { getStats } from "@server/server/stats";
import { updateItem } from "@server/server/updateItem";
import { logger } from "@server/utils/logger";

import { middleware, procedure, router } from "./trpc";

const itemSchema = z.object({
  type: z.enum(ItemTypes),
  isbn: z.string(),
  author: z.string(),
  title: z.string(),
  publisher: z.string(),
  distributor: z.string(),
  keywords: z.string().nullable(),
  datebought: z.string(),
  comments: z.string().nullable(),
  price: z.string(),
  amount: z.number(),
  tva: z.enum(TVAValues),
});

const payCartSchema = z.object({
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  paymentType: z.enum(["cash", "card", "check", "check-lire", "transfer"]),
  amount: z.string().regex(/^(-?\d+(\.\d+)?)?$/),
});

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
      z.object({ search: z.record(z.string(), z.string()), page: z.number() }),
    )
    .query(async ({ input }) => await advancedSearch(input.search, input.page)),
  asideCart: authProcedure.query(
    async ({ ctx }) => await getAsideCart(ctx.user.id),
  ),
  bestsales: authProcedure.query(getBestSales),
  bookmarks: authProcedure.query(getBookmarks),
  cart: authProcedure.query(async ({ ctx }) => await getCart(ctx.user.id)),
  items: authProcedure
    .input(z.number())
    .query(async ({ input }) => await getItems({ pageNumber: input })),
  customer: authProcedure
    .input(z.number())
    .query(async ({ input }) => await getCustomer(input)),
  customers: authProcedure
    .input(
      z.object({
        pageNumber: z.number(),
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
  order: authProcedure
    .input(z.number())
    .query(async ({ input }) => await getOrder(input)),
  itemOrders: authProcedure
    .input(z.number())
    .query(async ({ input }) => await getItemOrders(input)),
  orders: authProcedure
    .input(zOrderStatusArray)
    .query(async ({ input }) => await getOrders(input)),
  customerOrders: authProcedure
    .input(z.number())
    .query(async ({ input }) => await getCustomerActiveOrders(input)),
  lastSales: authProcedure
    .input(z.number())
    .query(async ({ input }) => await lastSales(input)),
  quicksearch: authProcedure
    .input(
      z.object({
        search: z.string(),
        page: z.number().default(1),
        inStock: z.boolean().default(false),
      }),
    )
    .query(async ({ input }) => await searchItems(input)),
  sales: adminProcedure.query(getSales),
  salesByDay: authProcedure
    .input(z.string().regex(/^\d{4}-\d\d-\d\d$/))
    .query(async ({ ctx, input }) =>
      getSalesByDay(input, { restrictToToday: ctx.user.role !== "admin" }),
    ),
  salesByMonth: adminProcedure
    .input(
      z.object({ month: z.string().length(2), year: z.string().length(4) }),
    )
    .query(async ({ input }) => await getSalesByMonth(input.month, input.year)),
  searchItem: authProcedure
    .input(z.number())
    .query(async ({ input }) => await getItem(input)),
  stats: authProcedure.query(getStats),
  user: procedure.query(({ ctx }) => ctx.user),
  isbnSearch: authProcedure
    .input(z.string().regex(/^\d{10,}$/))
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
  addItem: authProcedure.input(itemSchema).mutation(async ({ ctx, input }) => {
    logger.info("Add new item", { user: ctx.user, item: input });
    return await addItem(input);
  }),
  addNewItemToCart: authProcedure
    .input(
      z.object({
        price: z.string(),
        title: z.string(),
        tva: z.enum(TVAValues),
        type: z.enum(ItemTypes),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      logger.info("Add new item to cart", { user: ctx.user, item: input });
      await addNewItemToCart(ctx.user.id, input);
    }),
  addToCart: authProcedure
    .input(z.object({ id: z.number(), quantity: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      logger.info("Add to cart", { user: ctx.user, item: input });
      await addToCart(ctx.user.id, input.id, input.quantity);
    }),
  deleteSale: authProcedure
    .input(
      z.object({
        saleId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      logger.info("Delete sale", { user: ctx.user, input });
      await deleteSale(input.saleId, {
        restrictToToday: ctx.user.role !== "admin",
      });
    }),
  deleteCustomer: authProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      logger.info("Delete customer", { user: ctx.user, input });
      return await deleteCustomer(input.id);
    }),
  updateCustomer: authProcedure
    .input(
      z.object({
        customerId: z.number().optional(),
        customer: z.object({
          fullname: z.string(),
          phone: z.string().nullable(),
          email: z.string().nullable(),
          contact: z.string(),
          comment: z.string(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const customer = {
        ...input.customer,
        phone: input.customer.phone ?? null,
        email: input.customer.email ?? null,
        nmFullname: norm(input.customer.fullname),
      };
      if (input.customerId) {
        logger.info("Update customer", {
          customerId: input.customerId,
          fullname: input.customer.fullname,
        });
        return await setCustomer(customer, input.customerId);
      } else {
        logger.info("New customer", { fullname: input.customer.fullname });
        return await newCustomer(customer);
      }
    }),
  payCart: authProcedure
    .input(payCartSchema)
    .mutation(async ({ input, ctx }) => {
      logger.info("Pay cart", { user: ctx.user, cart: input });
      return await payCart(ctx.user.id, input);
    }),
  putCartAside: authProcedure.mutation(async ({ ctx }) => {
    await putCartAside(ctx.user.id);
  }),
  reactivateCart: authProcedure.mutation(async ({ ctx }) => {
    await reactivateCart(ctx.user.id);
  }),
  removeFromCart: authProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      logger.info("Remove from cart", { user: ctx.user, cartItemId: input });
      await removeFromCart(ctx.user.id, input);
    }),
  star: authProcedure
    .input(z.object({ id: z.number(), starred: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      logger.info(`${input.starred ? "Star" : "Unstar"} item ${input.id}`, {
        user: ctx.user,
      });
      return await starItem(input.id, input.starred);
    }),
  updateItem: authProcedure
    .input(z.object({ item: itemSchema, id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      logger.info("Update item", { user: ctx.user, item: input });
      return await updateItem(input.item, input.id);
    }),
  selectCustomer: authProcedure
    .input(
      z.object({
        customerId: z.number().nullable(),
        asideCart: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      logger.info(`${ctx.user.name} - Select customer ${input.customerId}`);
      return await setSelectedCustomer({ ...input, userId: ctx.user.id });
    }),
  newOrder: authProcedure.input(zOrder).mutation(async ({ ctx, input }) => {
    logger.info("New order", { user: ctx.user, order: input });
    return await newOrder(input);
  }),
  updateOrder: authProcedure
    .input(
      z.object({
        order: zOrder,
        id: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      logger.info("Update order", {
        user: ctx.user,
        order: input.order,
        orderId: input.id,
      });
      return await setOrder(input.order, input.id);
    }),
  setCustomerNotified: authProcedure
    .input(
      z.object({
        orderId: z.number(),
        customerNotified: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      logger.info("Set customer notified", { user: ctx.user, ...input });
      return await setCustomerNotified(input.orderId, input.customerNotified);
    }),
  deleteOrder: authProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      logger.info("Delete order", { user: ctx.user, input });
      return await deleteOrder(input.id);
    }),
});

export type AppRouter = typeof appRouter;
