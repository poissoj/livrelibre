import { eq, sql } from "drizzle-orm";
import type { Context } from "hono";

import { formatDate } from "@livrelibre/shared/date";
import { type DilicomRowWithId } from "@livrelibre/shared/dilicomItem";
import { items } from "@livrelibre/shared/schema";
import { norm } from "@livrelibre/shared/utils";

import { type User } from "@server/auth";
import { db } from "@server/db/database";
import { logger } from "@server/utils/logger";

export const finalizeImportRoute = async (c: Context) => {
  const user = c.get("user") as User;
  if (user.role === "anonymous") {
    return c.json({ error: "Unauthenticated" }, 401);
  }
  const data = await c.req.json<DilicomRowWithId[]>();
  const books = data.map((row) => ({
    isbn: row.EAN.trim(),
    qty: row.QTE,
    price: row.PRIX,
  }));
  logger.info(`Import ${data.length} books`, { user, books });
  const today = formatDate(new Date()).split("-").reverse().join("/");
  const booksToAdd: (typeof items.$inferInsert)[] = [];
  for (const row of data) {
    const price = String(row.PRIX);
    if (row.id) {
      await db
        .update(items)
        .set({ amount: sql`${items.amount} + ${row.QTE}`, price })
        .where(eq(items.id, row.id));
      continue;
    }
    const book: typeof items.$inferInsert = {
      amount: row.QTE,
      datebought: today,
      isbn: row.EAN.trim(),
      price,
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
    };
    booksToAdd.push(book);
  }
  if (booksToAdd.length > 0) {
    await db.insert(items).values(booksToAdd);
    logger.info(`Added ${booksToAdd.length} new books`, {
      user,
      isbns: booksToAdd.map((book) => book.isbn),
    });
  }
  return c.json({ status: "Import ok" });
};
