import { eq, sql } from "drizzle-orm";
import { getIronSession } from "iron-session";
import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";

import { db } from "@/db/database";
import { items } from "@/db/schema";
import { type SessionData, sessionOptions } from "@/lib/session";
import { formatDate } from "@/utils/date";
import type { DilicomRowWithId } from "@/utils/dilicomItem";
import { logger } from "@/utils/logger";
import { norm } from "@/utils/utils";

const router = createRouter<NextApiRequest, NextApiResponse>();

const finalizeImport = router.handler({
  onError(error, _req, res) {
    logger.error(error);
    res.status(500).json({ error: "Server error" });
  },
  onNoMatch(req, res) {
    res
      .status(405)
      .json({ error: `Method '${req.method || "??"}' Not Allowed` });
  },
});

router.post(async (req, res) => {
  const data = JSON.parse(req.body as string) as DilicomRowWithId[];
  const { user } = await getIronSession<SessionData>(req, res, sessionOptions);
  if (!user) {
    res.status(401).json({ error: "Unauthenticated" });
    return;
  }
  const books = data.map((row) => ({
    isbn: row.EAN,
    qty: row.QTE,
    price: row.PRIX,
  }));
  logger.info(`Import ${data.length} books`, {
    user,
    books,
  });
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
      isbn: row.EAN,
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
      _id: "",
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
  res.json({ status: "Import ok" });
});

export default finalizeImport;
