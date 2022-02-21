import type { NextApiRequest, NextApiResponse } from "next";

import { getDb } from "@/server/database";
import { formatDate } from "@/utils/date";
import { ITEM_TYPES, ItemType } from "@/utils/item";
import { logger } from "@/utils/logger";

type Item = {
  title?: string;
  author?: string;
  distributor?: string;
  amount: number;
  prix_achat: string;
  price: string;
  type: ItemType;
};

const trim = (str: string | undefined) => str?.trim() || "";
const formatNumber = (n: string | undefined) => n?.replace(".", ",") || "";

const exportCSV = async (req: NextApiRequest, res: NextApiResponse) => {
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
          prix_achat: 1,
          price: 1,
          type: 1,
        },
      },
      { $sort: { distributor: 1, author: 1, title: 1 } },
    ])
    .toArray();
  const HEADER =
    "Catégorie,Titre,Auteur,Distributeur,Qté,Prix achat,Valeur TTC\n";
  const csv =
    HEADER +
    items
      .map((item) =>
        [
          `"${ITEM_TYPES[item.type]}"`,
          `"${trim(item.title)}"`,
          `"${trim(item.author)}"`,
          `"${trim(item.distributor)}"`,
          item.amount,
          `"${formatNumber(item.prix_achat)}"`,
          `"${formatNumber(item.price)}"`,
        ].join()
      )
      .join("\n");
  res.setHeader("Content-Type", "text/csv");
  const date = formatDate(new Date());
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="stocks-${date}.csv"`
  );
  logger.info("Export stock", { nbItems: items.length });
  res.send(csv);
};

export default exportCSV;
