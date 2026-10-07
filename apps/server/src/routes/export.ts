import { ne } from "drizzle-orm";
import type { Context } from "hono";

import { formatDate } from "@livrelibre/shared/date";
import { ERROR_CODES } from "@livrelibre/shared/errors";
import { ITEM_TYPES } from "@livrelibre/shared/item";
import { items } from "@livrelibre/shared/schema";

import { type User } from "@server/auth";
import { db } from "@server/db/database";
import { logError } from "@server/utils/logError";
import { logger } from "@server/utils/logger";

// Neutralizes spreadsheet formula injection while keeping CSV quoting valid.
const FORMULA_PREFIX = /^[=+\-@\t\r]/;
const csvCell = (value: string | number | undefined): string => {
  const str = value === undefined ? "" : String(value).trim();
  const safe = FORMULA_PREFIX.test(str) ? `'${str}` : str;
  return `"${safe.replaceAll('"', '""')}"`;
};
const formatNumber = (n: string | undefined) => n?.replace(".", ",") || "";

const makeCSV = async () => {
  const itemsList = await db
    .select()
    .from(items)
    .where(ne(items.amount, 0))
    .orderBy(items.distributor, items.author, items.title);
  logger.info("Export stock", { count: itemsList.length });
  const HEADER =
    "Catégorie,Titre,Auteur·ice,Distributeur,ISBN,Qté,Valeur TTC\n";
  const csv =
    HEADER +
    itemsList
      .map((item) =>
        [
          ITEM_TYPES[item.type],
          item.title,
          item.author,
          item.distributor,
          item.isbn,
          item.amount,
          formatNumber(item.price),
        ]
          .map(csvCell)
          .join(","),
      )
      .join("\n");

  return csv;
};

export const exportRoute = async (c: Context) => {
  const user = c.get("user") as User;
  if (user.role === "anonymous") {
    return c.json({ error: ERROR_CODES.UNAUTHENTICATED }, 401);
  }
  try {
    const csv = await makeCSV();
    const date = formatDate(new Date());
    c.header("Content-Type", "text/csv; charset=utf-8");
    c.header(
      "Content-Disposition",
      `attachment; filename="stocks-${date}.csv"`,
    );
    return c.body(csv);
  } catch (error) {
    logError("exportStock", error, { user });
    return c.json({ error: ERROR_CODES.EXPORT_FAILED }, 500);
  }
};
