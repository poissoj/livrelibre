import { ne } from "drizzle-orm";
import { getIronSession } from "iron-session";
import type { NextApiRequest, NextApiResponse } from "next";

import { db } from "@/db/database";
import { items } from "@/db/schema";
import { type SessionData, sessionOptions } from "@/lib/session";
import { formatDate } from "@/utils/date";
import { ITEM_TYPES } from "@/utils/item";
import { logger } from "@/utils/logger";

const trim = (str: string | undefined) => str?.trim() || "";
const formatString = (str: string | undefined) =>
  trim(str).replaceAll('"', '""');
const formatNumber = (n: string | undefined) => n?.replace(".", ",") || "";

const makeCSV = async () => {
  const itemsList = await db
    .select()
    .from(items)
    .where(ne(items.amount, 0))
    .orderBy(items.distributor, items.author, items.title);
  logger.info("Export stock", { nbItems: itemsList.length });
  const HEADER =
    "Catégorie,Titre,Auteur·ice,Distributeur,ISBN,Qté,Valeur TTC\n";
  const csv =
    HEADER +
    itemsList
      .map((item) =>
        [
          `"${ITEM_TYPES[item.type]}"`,
          `"${formatString(item.title)}"`,
          `"${formatString(item.author)}"`,
          `"${formatString(item.distributor)}"`,
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
