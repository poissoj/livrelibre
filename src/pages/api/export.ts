import { getIronSession } from "iron-session";
import type { NextApiRequest, NextApiResponse } from "next";

import { type SessionData, sessionOptions } from "@/lib/session";
import { getDb } from "@/server/database";
import { formatDate } from "@/utils/date";
import { ITEM_TYPES, type ItemType } from "@/utils/item";
import { logger } from "@/utils/logger";

type Item = {
  title?: string;
  author?: string;
  distributor?: string;
  amount: number;
  price: string;
  type: ItemType;
  isbn: string;
};

const trim = (str: string | undefined) => str?.trim() || "";
const formatNumber = (n: string | undefined) => n?.replace(".", ",") || "";

const makeCSV = async () => {
  const db = await getDb();
  const items = await db
    .collection("books")
    .aggregate<Item>([
      { $match: { amount: { $ne: 0 } } },
      {
        $project: {
          _id: 0,
          title: 1,
          author: 1,
          distributor: 1,
          amount: 1,
          price: 1,
          type: 1,
          isbn: 1,
        },
      },
      { $sort: { distributor: 1, author: 1, title: 1 } },
    ])
    .toArray();
  logger.info("Export stock", { nbItems: items.length });
  const HEADER =
    "Catégorie,Titre,Auteur·ice,Distributeur,ISBN,Qté,Valeur TTC\n";
  const csv =
    HEADER +
    items
      .map((item) =>
        [
          `"${ITEM_TYPES[item.type]}"`,
          `"${trim(item.title)}"`,
          `"${trim(item.author)}"`,
          `"${trim(item.distributor)}"`,
          item.isbn,
          item.amount,
          `"${formatNumber(item.price)}"`,
        ].join(),
      )
      .join("\n");

  return csv;
};

const exportCSV = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  if (!session.user) {
    res.status(401).json({ error: "Unauthenticated" });
    return;
  }
  try {
    const csv = await makeCSV();
    const date = formatDate(new Date());
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="stocks-${date}.csv"`,
    );
    res.send(csv);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Unable to export stock" });
  }
};

export default exportCSV;
