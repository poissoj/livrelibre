import { getBestSales } from "@/server/bestSales";
import { getBookmarks, starItem } from "@/server/bookmarks";
import { getItems } from "@/server/items";
import { getSales } from "@/server/sales";
import { lastSales } from "@/server/lastSales";
import { advancedSearch, getItem, searchItems } from "@/server/searchItem";
import { getStats } from "@/server/stats";
import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { getSalesByMonth } from "@/server/salesByMonth";
import { getSalesByDay } from "@/server/salesByDay";
import { addItem } from "@/server/addItem";
import { TVAValues } from "@/utils/item";

const itemSchema = z.object({
  type: z.string(),
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
  .router()
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
  });

// export type definition of API
export type AppRouter = typeof appRouter;

// export API handler
export default trpcNext.createNextApiHandler({
  router: appRouter,
  createContext: () => null,
});
