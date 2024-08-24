import { eq } from "drizzle-orm";

import { db } from "@/db/database";
import { items } from "@/db/schema";
import type { BaseItem } from "@/utils/item";
import { logger } from "@/utils/logger";
import { norm } from "@/utils/utils";

export const updateItem = async (
  item: BaseItem,
  id: number,
): Promise<{ type: "success" | "error"; msg: string }> => {
  const newItem: Partial<typeof items.$inferInsert> = {
    ...item,
    price: item.price.replace(",", "."),
    nmAuthor: norm(item.author),
    nmTitle: norm(item.title),
    nmPublisher: norm(item.publisher),
    nmDistributor: norm(item.distributor),
  };
  try {
    await db.update(items).set(newItem).where(eq(items.id, id));
    return { type: "success", msg: "L'article a été modifié" };
  } catch (error) {
    logger.error(error);
    return { type: "error", msg: "Impossible de modifier l'article" };
  }
};
