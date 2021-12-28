import { getDb } from "@/server/database";
import { ITEM_TYPES } from "@/utils/item";
import type { NextApiRequest, NextApiResponse } from "next";

type Item = {
  title?: string;
  author?: string;
  distributor?: string;
  amount: number;
  prix_achat: string;
  price: string;
  type: keyof typeof ITEM_TYPES;
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
  res.setHeader("Content-Disposition", 'attachment; filename="stocks.csv"');
  res.send(csv);
};

export default exportCSV;
