import * as trpcNext from "@trpc/server/adapters/next";
import { TRPCError } from "@trpc/server";
import { ObjectId } from "mongodb";
import { z } from "zod";

import { addItem } from "@/server/addItem";
import { getBestSales } from "@/server/bestSales";
import { getBookmarks, starItem } from "@/server/bookmarks";
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
} from "@/server/cart";
import { createContext } from "@/server/context";
import {
  deleteCustomer,
  getCustomer,
  getCustomers,
  getSelectedCustomer,
  newCustomer,
  searchCustomers,
  setCustomer,
  setSelectedCustomer,
} from "@/server/customers";
import { getItems } from "@/server/items";
import { lastSales } from "@/server/lastSales";
import {
  deleteOrder,
  getCustomerActiveOrders,
  getItemOrders,
  getOrder,
  getOrders,
  newOrder,
  setOrder,
} from "@/server/orders";
import { getSales } from "@/server/sales";
import { deleteSale, getSalesByDay } from "@/server/salesByDay";
import { getSalesByMonth } from "@/server/salesByMonth";
import { advancedSearch, getItem, searchItems } from "@/server/searchItem";
import { getStats } from "@/server/stats";
import { middleware, procedure, router } from "@/server/trpc";
import { updateItem } from "@/server/updateItem";
import { ItemTypes, TVAValues } from "@/utils/item";
import { logger } from "@/utils/logger";
import { dbIdSchema, zOrder, zOrderStatusArray } from "@/utils/order";
import { norm } from "@/utils/utils";

const itemSchema = z.object({
  type: z.enum(ItemTypes),
  isbn: z.string(),
  author: z.string(),
  title: z.string(),
  publisher: z.string(),
  distributor: z.string(),
  keywords: z.string(),
  datebought: z.string(),
  comments: z.string(),
  price: z.string(),
  amount: z.number(),
  tva: z.enum(TVAValues),
});

const updateItemSchema = itemSchema.extend({
  id: z.string(),
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

export const appRouter = router({
  // Queries
  advancedSearch: authProcedure
    .input(z.object({ search: z.record(z.string()), page: z.number() }))
    .query(async ({ input }) => await advancedSearch(input.search, input.page)),
  asideCart: authProcedure.query(
    async ({ ctx }) => await getAsideCart(ctx.user.name),
  ),
  bestsales: authProcedure.query(getBestSales),
  bookmarks: authProcedure.query(getBookmarks),
  cart: authProcedure.query(async ({ ctx }) => await getCart(ctx.user.name)),
  items: authProcedure
    .input(z.number())
    .query(async ({ input }) => await getItems({ pageNumber: input })),
  customer: authProcedure
    .input(dbIdSchema)
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
    const customer = await getSelectedCustomer(ctx.user.name, false);
    return customer?.customerId ? await getCustomer(customer.customerId) : null;
  }),
  order: authProcedure
    .input(dbIdSchema)
    .query(async ({ input }) => await getOrder(input)),
  itemOrders: authProcedure
    .input(dbIdSchema)
    .query(async ({ input }) => await getItemOrders(input)),
  orders: authProcedure
    .input(zOrderStatusArray)
    .query(async ({ input }) => await getOrders(input)),
  customerOrders: authProcedure
    .input(dbIdSchema)
    .query(async ({ input }) => await getCustomerActiveOrders(input)),
  lastSales: authProcedure
    .input(dbIdSchema)
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
  sales: authProcedure.query(getSales),
  salesByDay: authProcedure
    .input(z.string())
    .query(async ({ input }) => getSalesByDay(input)),
  salesByMonth: authProcedure
    .input(
      z.object({ month: z.string().length(2), year: z.string().length(4) }),
    )
    .query(async ({ input }) => await getSalesByMonth(input.month, input.year)),
  searchItem: authProcedure
    .input(dbIdSchema)
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
      return await addISBNToCart(ctx.user.name, input);
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
      await addNewItemToCart(ctx.user.name, input);
    }),
  addToCart: authProcedure
    .input(z.object({ id: dbIdSchema, quantity: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      logger.info("Add to cart", { user: ctx.user, item: input });
      await addToCart(ctx.user.name, input.id, input.quantity);
    }),
  deleteSale: authProcedure
    .input(
      z.object({
        saleId: dbIdSchema,
        itemId: dbIdSchema.nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      logger.info("Delete sale", { user: ctx.user, input });
      await deleteSale(input.saleId, input.itemId);
    }),
  deleteCustomer: authProcedure
    .input(z.object({ id: dbIdSchema }))
    .mutation(async ({ ctx, input }) => {
      logger.info("Delete customer", { user: ctx.user, input });
      return await deleteCustomer(input.id);
    }),
  updateCustomer: authProcedure
    .input(
      z.object({
        customerId: dbIdSchema.optional(),
        customer: z.object({
          fullname: z.string(),
          phone: z.string().optional(),
          email: z.string().optional(),
          contact: z.string(),
          comment: z.string(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const customer = {
        ...input.customer,
        nmFullname: norm(input.customer.fullname),
      };
      if (input.customerId) {
        logger.info("Update customer", input.customerId);
        return await setCustomer(customer, input.customerId);
      } else {
        logger.info("New customer", input.customer);
        return await newCustomer(customer);
      }
    }),
  payCart: authProcedure
    .input(payCartSchema)
    .mutation(async ({ input, ctx }) => {
      logger.info("Pay cart", { user: ctx.user, cart: input });
      return await payCart(ctx.user.name, input);
    }),
  putCartAside: authProcedure.mutation(async ({ ctx }) => {
    await putCartAside(ctx.user.name);
  }),
  reactivateCart: authProcedure.mutation(async ({ ctx }) => {
    await reactivateCart(ctx.user.name);
  }),
  removeFromCart: authProcedure
    .input(dbIdSchema)
    .mutation(async ({ ctx, input }) => {
      logger.info("Remove from cart", { user: ctx.user, cartItemId: input });
      await removeFromCart(input);
    }),
  star: authProcedure
    .input(z.object({ id: dbIdSchema, starred: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      logger.info(`${input.starred ? "Star" : "Unstar"} item ${input.id}`, {
        user: ctx.user,
      });
      return await starItem(new ObjectId(input.id), input.starred);
    }),
  updateItem: authProcedure
    .input(updateItemSchema)
    .mutation(async ({ ctx, input }) => {
      logger.info("Update item", { user: ctx.user, item: input });
      return await updateItem(input);
    }),
  selectCustomer: authProcedure
    .input(
      z.object({
        customerId: dbIdSchema.nullable(),
        asideCart: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      logger.info(`${ctx.user.name} - Select customer ${input.customerId}`);
      return await setSelectedCustomer({ ...input, username: ctx.user.name });
    }),
  newOrder: authProcedure.input(zOrder).mutation(async ({ ctx, input }) => {
    logger.info("New order", { user: ctx.user, order: input });
    return await newOrder(input, ctx.user.name);
  }),
  updateOrder: authProcedure
    .input(
      z.object({
        order: zOrder,
        id: dbIdSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      logger.info("Update order", {
        user: ctx.user,
        order: input.order,
        orderId: input.id,
      });
      return await setOrder(input.order, input.id, ctx.user.name);
    }),
  deleteOrder: authProcedure
    .input(z.object({ id: dbIdSchema }))
    .mutation(async ({ ctx, input }) => {
      logger.info("Delete order", { user: ctx.user, input });
      return await deleteOrder(input.id, ctx.user.name);
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
  onError({ error }) {
    logger.error(error);
  },
});
