import { ERROR_CODES } from "@livrelibre/shared/errors";
import type { BaseItem } from "@livrelibre/shared/item";
import { items } from "@livrelibre/shared/schema";
import { norm } from "@livrelibre/shared/utils";
import { db } from "@server/db/database";
import { isUniqueViolation } from "@server/utils/dbErrors";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

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
  let rows: { id: number }[];
  try {
    rows = await db.update(items).set(newItem).where(eq(items.id, id)).returning({ id: items.id });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new TRPCError({
        code: "CONFLICT",
        message: ERROR_CODES.ITEM_ALREADY_EXISTS,
      });
    }
    throw error;
  }
  if (rows.length === 0) {
    return { type: "error", msg: "L'article n'existe pas" };
  }
  return { type: "success", msg: "L'article a été modifié" };
};
