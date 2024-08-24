import { eq } from "drizzle-orm";

import { db } from "@/db/database";
import { type Item, items } from "@/db/schema";

export type Bookmark = Pick<Item, "id" | "amount" | "title">;

export const getBookmarks = async (): Promise<Bookmark[]> => {
  const bookmarks = await db.query.items.findMany({
    columns: {
      id: true,
      title: true,
      amount: true,
    },
    where: eq(items.starred, true),
    orderBy: items.title,
  });
  return bookmarks;
};

export const starItem = async (id: number, starred: boolean) => {
  return await db.update(items).set({ starred }).where(eq(items.id, id));
};
