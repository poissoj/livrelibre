import type { BaseItem, DBItem } from "@/utils/item";
import { logger } from "@/utils/logger";
import { norm } from "@/utils/utils";

import { getDb } from "./database";

export const addItem = async (
  item: BaseItem
): Promise<{ type: "success" | "warning" | "error"; msg: string }> => {
  const db = await getDb();
  const existingItem = await db
    .collection<DBItem>("books")
    .findOne({ isbn: item.isbn });
  if (existingItem && existingItem.isbn !== "") {
    return { type: "warning", msg: "Un article avec cet ISBN existe déjà." };
  }
  const newItem: Omit<DBItem, "starred"> = {
    ...item,
    amount: Number(item.amount),
    price: item.price.replace(",", "."),
    nmAuthor: norm(item.author),
    nmTitle: norm(item.title),
    nmPublisher: norm(item.publisher),
    nmDistributor: norm(item.distributor),
  };

  try {
    await db.collection<typeof newItem>("books").insertOne(newItem);
  } catch (error) {
    logger.error("Add new item", error);
    return { type: "error", msg: "Impossible d'ajouter cet article." };
  }
  return { type: "success", msg: `"${item.title}" a été ajouté.` };
};
