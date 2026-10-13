import { ITEMS_PER_PAGE } from "@livrelibre/shared/pagination";
import type { PaymentType } from "@livrelibre/shared/sale";
import { items, sales } from "@livrelibre/shared/schema";
import { norm, sanitize } from "@livrelibre/shared/utils";
import { db } from "@server/db/database";
import { type SQL, and, count, desc, eq, ilike, or, sql } from "drizzle-orm";

/** Columns displayed for each matched sale. */
const saleColumns = {
  id: sales.id,
  itemId: sales.itemId,
  title: sales.title,
  author: items.author,
  price: sql`${sales.price}`.mapWith(Number),
  quantity: sales.quantity,
  tva: sales.tva,
  paymentType: sales.paymentType,
  deleted: sales.deleted,
  date: sql<string>`to_char(${sales.created}, 'YYYY-MM-DD')`,
};

export const searchSales = async ({
  title = "",
  dateFrom,
  dateTo,
  paymentType,
  includeDeleted = false,
  pageNumber = 1,
}: {
  title?: string;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  paymentType?: PaymentType | undefined;
  includeDeleted?: boolean;
  pageNumber?: number;
}) => {
  const conditions: (SQL | undefined)[] = [];

  const term = title.trim();
  if (term !== "") {
    // Match the sale's own (possibly unlisted) title, or the current item title
    // (accent-insensitive) when the referenced item still exists.
    const prefix = term.replace(/[%_\\]/g, "\\$&");
    conditions.push(
      or(ilike(sales.title, `%${prefix}%`), sql`${items.nmTitle} ~* ${sanitize(norm(term))}`),
    );
  }
  if (dateFrom) {
    conditions.push(sql`${sales.created} >= ${dateFrom}::date`);
  }
  if (dateTo) {
    conditions.push(sql`${sales.created} < ${dateTo}::date + interval '1 day'`);
  }
  if (paymentType) {
    conditions.push(eq(sales.paymentType, paymentType));
  }
  if (!includeDeleted) {
    conditions.push(eq(sales.deleted, false));
  }

  const where = and(...conditions);
  const offset = (pageNumber - 1) * ITEMS_PER_PAGE;

  const [countResult, rows] = await Promise.all([
    db
      .select({ count: count() })
      .from(sales)
      .leftJoin(items, eq(sales.itemId, items.id))
      .where(where),
    db
      .select(saleColumns)
      .from(sales)
      .leftJoin(items, eq(sales.itemId, items.id))
      .where(where)
      .orderBy(desc(sales.created), desc(sales.id))
      .limit(ITEMS_PER_PAGE)
      .offset(offset),
  ]);

  return { sales: rows, count: countResult[0].count };
};
