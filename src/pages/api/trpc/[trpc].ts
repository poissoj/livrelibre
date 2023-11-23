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
import { getCustomers } from "@/server/customers";
import { getItems } from "@/server/items";
import { lastSales } from "@/server/lastSales";
import { getSales } from "@/server/sales";
import { deleteSale, getSalesByDay } from "@/server/salesByDay";
import { getSalesByMonth } from "@/server/salesByMonth";
import { advancedSearch, getItem, searchItems } from "@/server/searchItem";
import { getStats } from "@/server/stats";
import { middleware, procedure, router } from "@/server/trpc";
import { updateItem } from "@/server/updateItem";
import { ItemTypes, TVAValues } from "@/utils/item";
import { logger } from "@/utils/logger";

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
  customers: authProcedure
    .input(z.number())
    .query(async ({ input }) => await getCustomers({ pageNumber: input })),
  lastSales: authProcedure
    .input(z.string().length(24))
    .query(async ({ input }) => await lastSales(input)),
  quicksearch: authProcedure
    .input(
      z.object({
        search: z.string(),
        page: z.number(),
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
    .input(z.string().length(24))
    .query(async ({ input }) => await getItem(input)),
  stats: authProcedure.query(getStats),
  user: procedure.query(({ ctx }) => ctx.user),
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
    .input(
      z.object({ id: z.string().length(24), quantity: z.number().optional() }),
    )
    .mutation(async ({ input, ctx }) => {
      logger.info("Add to cart", { user: ctx.user, item: input });
      await addToCart(ctx.user.name, input.id, input.quantity);
    }),
  deleteSale: authProcedure
    .input(
      z.object({
        saleId: z.string().length(24),
        itemId: z.string().length(24).nullish(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      logger.info("Delete sale", { user: ctx.user, input });
      await deleteSale(input.saleId, input.itemId);
    }),
  isbnSearch: authProcedure
    .input(z.string().regex(/^\d{10,}$/))
    .mutation(async ({ input }) => {
      return await searchItems({ search: input });
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
    .input(z.string().length(24))
    .mutation(async ({ ctx, input }) => {
      logger.info("Remove from cart", { user: ctx.user, cartItemId: input });
      await removeFromCart(input);
    }),
  star: authProcedure
    .input(z.object({ id: z.string().length(24), starred: z.boolean() }))
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
