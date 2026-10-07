import { sql } from "drizzle-orm";
import type { Context } from "hono";

import { formatDate } from "@livrelibre/shared/date";
import {
  importPayloadSchema,
  mergeRowsByEan,
} from "@livrelibre/shared/dilicomItem";
import { ERROR_CODES } from "@livrelibre/shared/errors";
import { items } from "@livrelibre/shared/schema";
import { norm } from "@livrelibre/shared/utils";

import { type User } from "@server/auth";
import { db } from "@server/db/database";
import { logger } from "@server/utils/logger";

export const finalizeImportRoute = async (c: Context) => {
  const user = c.get("user") as User;
  if (user.role === "anonymous") {
    return c.json({ error: ERROR_CODES.UNAUTHENTICATED }, 401);
  }
  const body = await c.req.json<unknown>().catch(() => null);
  const parsed = importPayloadSchema.safeParse(body);
  if (!parsed.success) {
    logger.info("Invalid import payload", {
      user,
      errors: parsed.error.issues,
    });
    return c.json({ error: ERROR_CODES.IMPORT_INVALID }, 400);
  }
  // Merge duplicate EANs: a single INSERT with ON CONFLICT cannot affect the
  // same row twice, and the quantities must be summed.
  const data = mergeRowsByEan(parsed.data);
  logger.info("Import books", {
    user,
    count: data.length,
    isbns: data.map((row) => row.EAN),
  });
  const today = formatDate(new Date());
  const booksToAdd: (typeof items.$inferInsert)[] = data.map((row) => ({
    amount: row.QTE,
    datebought: today,
    isbn: row.EAN,
    price: String(row.PRIX),
    tva: "5.5",
    type: "book",
    author: row.AUTEUR,
    nmAuthor: norm(row.AUTEUR),
    title: row.TITRE,
    nmTitle: norm(row.TITRE),
    publisher: row.EDITEUR,
    nmPublisher: norm(row.EDITEUR),
    distributor: row.DISTRIBUTEUR,
    nmDistributor: norm(row.DISTRIBUTEUR),
    starred: false,
    keywords: "",
    comments: "",
  }));
  await db.transaction(async (tx) => {
    // Upsert by ISBN: the write target comes from the imported EAN, never from
    // a client-provided id. Existing stock is incremented, new books inserted.
    await tx
      .insert(items)
      .values(booksToAdd)
      .onConflictDoUpdate({
        target: items.isbn,
        targetWhere: sql`${items.isbn} != ''`,
        set: {
          amount: sql`${items.amount} + excluded.amount`,
          price: sql`excluded.price`,
        },
      });
    logger.info("Imported books", {
      user,
      count: booksToAdd.length,
      isbns: booksToAdd.map((book) => book.isbn),
    });
  });
  return c.json({ status: "Import ok" });
};
