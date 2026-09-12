import { eq } from "drizzle-orm";

import type { BaseItem } from "@livrelibre/shared/item";
import { items } from "@livrelibre/shared/schema";
import { norm } from "@livrelibre/shared/utils";

import { db } from "@server/db/database";
import { logger } from "@server/utils/logger";

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
  try {
    await db.update(items).set(newItem).where(eq(items.id, id));
    return { type: "success", msg: "L'article a été modifié" };
  } catch (error) {
    logger.error(error);
    return { type: "error", msg: "Impossible de modifier l'article" };
  }
};
