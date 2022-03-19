import { withIronSessionApiRoute } from "iron-session/next";
import { ObjectId } from "mongodb";
import type { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";

import { sessionOptions } from "@/lib/session";
import { getDb } from "@/server/database";
import { formatDate } from "@/utils/date";
import type { DilicomRowWithId } from "@/utils/dilicomItem";
import type { DBItem } from "@/utils/item";
import { logger } from "@/utils/logger";
import { norm } from "@/utils/utils";

const finalizeImport = nc<NextApiRequest, NextApiResponse>({
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

finalizeImport.post(async (req, res) => {
  const data = JSON.parse(req.body as string) as DilicomRowWithId[];
  const { user } = req.session;
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
  const booksToAdd: DBItem[] = [];
  const db = await getDb();
  for (const row of data) {
    if (row.id) {
      void db
        .collection("books")
        .updateOne(
          { _id: new ObjectId(row.id) },
          { $inc: { amount: row.QTE }, $set: { price: row.PRIX } }
        );
      continue;
    }
    const book: DBItem = {
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
      prix_achat: "",
    };
    booksToAdd.push(book);
  }
  if (booksToAdd.length > 0) {
    await db.collection("books").insertMany(booksToAdd);
    logger.info(`Added ${booksToAdd.length} new books`, {
      user,
      isbns: booksToAdd.map((book) => book.isbn),
    });
  }
  res.json({ status: "Import ok" });
});

export default withIronSessionApiRoute(finalizeImport, sessionOptions);