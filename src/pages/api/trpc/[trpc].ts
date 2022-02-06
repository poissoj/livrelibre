import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { ObjectId } from "mongodb";
import { z } from "zod";

import { addItem } from "@/server/addItem";
import { getBestSales } from "@/server/bestSales";
import { getBookmarks, starItem } from "@/server/bookmarks";
import {
  addNewItemToCart,
  addToCart,
  getCart,
  payCart,
  removeFromCart,
} from "@/server/cart";
import { Context, createContext } from "@/server/context";
import { getItems } from "@/server/items";
import { lastSales } from "@/server/lastSales";
import { getSales } from "@/server/sales";
import { deleteSale, getSalesByDay } from "@/server/salesByDay";
import { getSalesByMonth } from "@/server/salesByMonth";
import { advancedSearch, getItem, searchItems } from "@/server/searchItem";
import { getStats } from "@/server/stats";
import { ItemTypes, TVAValues } from "@/utils/item";

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
  prix_achat: z.string(),
  price: z.string(),
  amount: z.number(),
  tva: z.enum(TVAValues),
});

export const appRouter = trpc
  .router<Context>()
  .query("bookmarks", {
    async resolve() {
      return await getBookmarks();
    },
  })
  .query("sales", {
    async resolve() {
      return await getSales();
    },
  })
  .query("searchItem", {
    input: z.string().length(24),
    async resolve({ input }) {
      return await getItem(input);
    },
  })
  .query("quicksearch", {
    input: z.string(),
    async resolve({ input }) {
      return await searchItems(input);
    },
  })
  .query("advancedSearch", {
    input: z.record(z.string()),
    async resolve({ input }) {
      return await advancedSearch(input);
    },
  })
  .query("items", {
    async resolve() {
      return await getItems();
    },
  })
  .query("bestsales", {
    async resolve() {
      return await getBestSales();
    },
  })
  .query("stats", {
    async resolve() {
      return await getStats();
    },
  })
  .query("lastSales", {
    input: z.string().length(24),
    async resolve({ input }) {
      return await lastSales(input);
    },
  })
  .query("salesByMonth", {
    input: z.object({
      month: z.string().length(2),
      year: z.string().length(4),
    }),
    async resolve({ input }) {
      return await getSalesByMonth(input.month, input.year);
    },
  })
  .query("salesByDay", {
    input: z.string(),
    async resolve({ input }) {
      return await getSalesByDay(input);
    },
  })
  .query("user", {
    resolve({ ctx }) {
      return ctx.user;
    },
  })
  .query("cart", {
    async resolve({ ctx }) {
      return await getCart(ctx.user.name);
    },
  })
  .mutation("star", {
    input: z.object({
      id: z.string().length(24),
      starred: z.boolean(),
    }),
    async resolve({ input }) {
      return await starItem(new ObjectId(input.id), input.starred);
    },
  })
  .mutation("addItem", {
    input: itemSchema,
    async resolve({ input }) {
      return await addItem(input);
    },
  })
  .mutation("payCart", {
    input: z.object({
      paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      paymentType: z.enum(["cash", "card", "check", "check-lire", "transfer"]),
      amount: z.string().regex(/^(-?\d+(\.\d+)?)?$/),
    }),
    async resolve({ input, ctx }) {
      return await payCart(ctx.user.name, input);
    },
  })
  .mutation("addToCart", {
    input: z.object({
      id: z.string().length(24),
      quantity: z.number().optional(),
    }),
    async resolve({ input, ctx }) {
      return await addToCart(ctx.user.name, input.id, input.quantity);
    },
  })
  .mutation("addNewItemToCart", {
    input: z.object({
      price: z.string(),
      title: z.string(),
      tva: z.enum(TVAValues),
      type: z.enum(ItemTypes),
    }),
    async resolve({ input, ctx }) {
      return await addNewItemToCart(ctx.user.name, input);
    },
  })
  .mutation("removeFromCart", {
    input: z.string().length(24),
    async resolve({ input }) {
      return await removeFromCart(input);
    },
  })
  .mutation("deleteSale", {
    input: z.object({
      saleId: z.string().length(24),
      itemId: z.string().length(24).nullish(),
    }),
    async resolve({ input }) {
      return await deleteSale(input.saleId, input.itemId);
    },
  });

// export type definition of API
export type AppRouter = typeof appRouter;

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext,
});
