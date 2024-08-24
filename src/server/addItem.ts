import { eq } from "drizzle-orm";

import { db } from "@/db/database";
import { items as itemsTable } from "@/db/schema";
import type { BaseItem } from "@/utils/item";
import { logger } from "@/utils/logger";
import { norm } from "@/utils/utils";

export const addItem = async (
  item: BaseItem,
): Promise<{ type: "success" | "warning" | "error"; msg: string }> => {
  const existingItem = await db.query.items.findFirst({
    where: eq(itemsTable.isbn, item.isbn),
  });
  if (existingItem && existingItem.isbn !== "") {
    return { type: "warning", msg: "Un article avec cet ISBN existe déjà." };
  }
  const newItem: typeof itemsTable.$inferInsert = {
    ...item,
    starred: false,
    amount: Number(item.amount),
    price: item.price.replace(",", "."),
    nmAuthor: norm(item.author),
    nmTitle: norm(item.title),
    nmPublisher: norm(item.publisher),
    nmDistributor: norm(item.distributor),
    _id: "",
  };

  try {
    await db.insert(itemsTable).values(newItem);
  } catch (error) {
    logger.error("Add new item", error);
    return { type: "error", msg: "Impossible d'ajouter cet article." };
  }
  return { type: "success", msg: `"${item.title}" a été ajouté.` };
};
