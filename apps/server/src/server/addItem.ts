import { eq } from "drizzle-orm";

import type { BaseItem } from "@livrelibre/shared/item";
import { items as itemsTable } from "@livrelibre/shared/schema";
import { norm } from "@livrelibre/shared/utils";

import { db } from "@server/db/database";
import { logger } from "@server/utils/logger";

export const addItem = async (
  item: BaseItem,
): Promise<{ type: "success" | "warning" | "error"; msg: string }> => {
  const isbn = item.isbn.trim();
  const existingItem = await db.query.items.findFirst({
    where: eq(itemsTable.isbn, isbn),
  });
  if (existingItem && existingItem.isbn !== "") {
    return { type: "warning", msg: "Un article avec cet ISBN existe déjà." };
  }
  const newItem: typeof itemsTable.$inferInsert = {
    ...item,
    isbn,
    starred: false,
    amount: item.amount,
    price: item.price.replace(",", "."),
    nmAuthor: norm(item.author),
    nmTitle: norm(item.title),
    nmPublisher: norm(item.publisher),
    nmDistributor: norm(item.distributor),
  };

  try {
    await db.insert(itemsTable).values(newItem);
  } catch (error) {
    logger.error("Add new item", error);
    return { type: "error", msg: "Impossible d'ajouter cet article." };
  }
  return { type: "success", msg: `"${item.title}" a été ajouté.` };
};
