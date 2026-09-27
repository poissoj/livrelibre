import { eq } from "drizzle-orm";

import type { BaseItem } from "@livrelibre/shared/item";
import { items } from "@livrelibre/shared/schema";
import { norm } from "@livrelibre/shared/utils";

import { db } from "@server/db/database";

export const updateItem = async (
  item: BaseItem,
  id: number,
): Promise<{ type: "success" | "error"; msg: string }> => {
  const newItem: Partial<typeof items.$inferInsert> = {
    ...item,
    isbn: item.isbn.trim(),
    price: item.price.replace(",", "."),
    nmAuthor: norm(item.author),
    nmTitle: norm(item.title),
    nmPublisher: norm(item.publisher),
    nmDistributor: norm(item.distributor),
  };
  const rows = await db
    .update(items)
    .set(newItem)
    .where(eq(items.id, id))
    .returning({ id: items.id });
  if (rows.length === 0) {
    return { type: "error", msg: "L'article n'existe pas" };
  }
  return { type: "success", msg: "L'article a été modifié" };
};
