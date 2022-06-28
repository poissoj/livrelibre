import * as trpc from "@trpc/server";
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
import { Context, createContext } from "@/server/context";
import { getItems } from "@/server/items";
import { lastSales } from "@/server/lastSales";
import { getSales } from "@/server/sales";
import { deleteSale, getSalesByDay } from "@/server/salesByDay";
import { getSalesByMonth } from "@/server/salesByMonth";
import { advancedSearch, getItem, searchItems } from "@/server/searchItem";
import { getStats } from "@/server/stats";
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

export const appRouter = trpc
  .router<Context>()
  .middleware(({ ctx, next }) => {
    if (ctx.user.role === "anonymous") {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  })
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
    input: z.object({
      search: z.string(),
      page: z.number(),
      inStock: z.boolean().default(false),
    }),
    async resolve({ input }) {
      return await searchItems(input);
    },
  })
  .query("advancedSearch", {
    input: z.object({
      search: z.record(z.string()),
      page: z.number(),
    }),
    async resolve({ input }) {
      return await advancedSearch(input.search, input.page);
    },
  })
  .query("items", {
    input: z.number(),
    async resolve({ input }) {
      return await getItems({ pageNumber: input });
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
  .query("asideCart", {
    async resolve({ ctx }) {
      return await getAsideCart(ctx.user.name);
    },
  })
  .mutation("star", {
    input: z.object({
      id: z.string().length(24),
      starred: z.boolean(),
    }),
    async resolve({ ctx, input }) {
      logger.info(`${input.starred ? "Star" : "Unstar"} item ${input.id}`, {
        user: ctx.user,
      });
      return await starItem(new ObjectId(input.id), input.starred);
    },
  })
  .mutation("addItem", {
    input: itemSchema,
    async resolve({ ctx, input }) {
      logger.info("Add new item", { user: ctx.user, item: input });
      return await addItem(input);
    },
  })
  .mutation("updateItem", {
    input: updateItemSchema,
    async resolve({ ctx, input }) {
      logger.info("Update item", { user: ctx.user, item: input });
      return await updateItem(input);
    },
  })
  .mutation("payCart", {
    input: z.object({
      paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      paymentType: z.enum(["cash", "card", "check", "check-lire", "transfer"]),
      amount: z.string().regex(/^(-?\d+(\.\d+)?)?$/),
    }),
    async resolve({ input, ctx }) {
      logger.info("Pay cart", { user: ctx.user, cart: input });
      return await payCart(ctx.user.name, input);
    },
  })
  .mutation("addToCart", {
    input: z.object({
      id: z.string().length(24),
      quantity: z.number().optional(),
    }),
    async resolve({ input, ctx }) {
      logger.info("Add to cart", { user: ctx.user, item: input });
      return await addToCart(ctx.user.name, input.id, input.quantity);
    },
  })
  .mutation("addISBNToCart", {
    input: z.string().regex(/^\d{10,13}$/),
    async resolve({ input, ctx }) {
      logger.info("Quick add to cart", { user: ctx.user, isbn: input });
      return await addISBNToCart(ctx.user.name, input);
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
      logger.info("Add new item to cart", { user: ctx.user, item: input });
      return await addNewItemToCart(ctx.user.name, input);
    },
  })
  .mutation("removeFromCart", {
    input: z.string().length(24),
    async resolve({ ctx, input }) {
      logger.info("Remove from cart", { user: ctx.user, cartItemId: input });
      return await removeFromCart(input);
    },
  })
  .mutation("deleteSale", {
    input: z.object({
      saleId: z.string().length(24),
      itemId: z.string().length(24).nullish(),
    }),
    async resolve({ ctx, input }) {
      logger.info("Delete sale", { user: ctx.user, input });
      return await deleteSale(input.saleId, input.itemId);
    },
  })
  .mutation("isbnSearch", {
    input: z.string().regex(/^\d{10,}$/),
    async resolve({ input }) {
      return await searchItems({ search: input });
    },
  })
  .mutation("putCartAside", {
    async resolve({ ctx }) {
      return await putCartAside(ctx.user.name);
    },
  })
  .mutation("reactivateCart", {
    async resolve({ ctx }) {
      return await reactivateCart(ctx.user.name);
    },
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
