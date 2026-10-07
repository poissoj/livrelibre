import { ERROR_CODES } from "@livrelibre/shared/errors";
import type { BaseItem } from "@livrelibre/shared/item";
import { items as itemsTable } from "@livrelibre/shared/schema";
import { norm } from "@livrelibre/shared/utils";
import { db } from "@server/db/database";
import { isUniqueViolation } from "@server/utils/dbErrors";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

const duplicateItemError = () =>
  new TRPCError({
    code: "CONFLICT",
    message: ERROR_CODES.ITEM_ALREADY_EXISTS,
  });

export const addItem = async (
  item: BaseItem,
): Promise<{ type: "success" | "error"; msg: string }> => {
  const isbn = item.isbn.trim();
  const existingItem = await db.query.items.findFirst({
    where: eq(itemsTable.isbn, isbn),
  });
  if (existingItem && existingItem.isbn !== "") {
    throw duplicateItemError();
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
    if (isUniqueViolation(error)) {
      throw duplicateItemError();
    }
    throw error;
  }
  return { type: "success", msg: `"${item.title}" a été ajouté.` };
};
