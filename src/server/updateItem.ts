import { ObjectId } from "mongodb";

import type { BaseItem, DBItem } from "@/utils/item";
import { logger } from "@/utils/logger";
import { norm } from "@/utils/utils";

import { getDb } from "./database";

type FormItem = BaseItem & { id: string };

export const updateItem = async (
  item: FormItem
): Promise<{ type: "success" | "error"; msg: string }> => {
  const db = await getDb();
  const newItem: Omit<DBItem, "starred"> = {
    ...item,
    price: item.price.replace(",", "."),
    nmAuthor: norm(item.author),
    nmTitle: norm(item.title),
    nmPublisher: norm(item.publisher),
    nmDistributor: norm(item.distributor),
  };
  try {
    await db
      .collection("books")
      .updateOne({ _id: new ObjectId(item.id) }, { $set: newItem });
    return { type: "success", msg: "L'article a été modifié" };
  } catch (error) {
    logger.error(error);
    return { type: "error", msg: "Impossible de modifier l'article" };
  }
};
