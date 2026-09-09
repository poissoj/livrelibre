import { ne } from "drizzle-orm";
import type { Context } from "hono";

import { formatDate } from "@livrelibre/shared/date";
import { ITEM_TYPES } from "@livrelibre/shared/item";
import { items } from "@livrelibre/shared/schema";

import { type User } from "@server/auth";
import { db } from "@server/db/database";
import { logger } from "@server/utils/logger";

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

export const exportRoute = async (c: Context) => {
  const user = c.get("user") as User;
  if (user.role === "anonymous") {
    return c.json({ error: "Unauthenticated" }, 401);
  }
  try {
    const csv = await makeCSV();
    const date = formatDate(new Date());
    c.header("Content-Type", "text/csv");
    c.header(
      "Content-Disposition",
      `attachment; filename="stocks-${date}.csv"`,
    );
    return c.body(csv);
  } catch (error) {
    logger.error(error);
    return c.json({ error: "Unable to export stock" }, 500);
  }
};
