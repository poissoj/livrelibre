import { and, desc, eq, sql, sum } from "drizzle-orm";

import { sales } from "@livrelibre/shared/schema";

import { db } from "@server/db/database";

export const getSalesByMonth = async (month: string, year: string) => {
  const monthStart = `${year}-${month}-01`;
  const reqSales = db
    .select({
      date: sql<string>`to_char(${sales.created}, 'YYYY-MM-dd')`,
      count: sum(
        sql`CASE WHEN ${sales.deleted} THEN 0 ELSE ${sales.quantity} END`,
      ).mapWith(Number),
      total: sum(
        sql`CASE WHEN ${sales.deleted} THEN 0 ELSE ${sales.price} END`,
      ),
    })
    .from(sales)
    .where(
      and(
        sql`${sales.created} >= ${monthStart}::date`,
        sql`${sales.created} < ${monthStart}::date + interval '1 month'`,
      ),
    )
    .groupBy(({ date }) => date)
    .orderBy(({ date }) => desc(date));
  const reqStats = db
    .select({
      paymentType: sales.paymentType,
      tva: sales.tva,
      nb: sum(sales.quantity).mapWith(Number),
      total: sum(sales.price),
    })
    .from(sales)
    .where(
      and(
        eq(sales.deleted, false),
        sql`${sales.created} >= ${monthStart}::date`,
        sql`${sales.created} < ${monthStart}::date + interval '1 month'`,
      ),
    )
    .groupBy(sales.paymentType, sales.tva)
    .orderBy(sales.tva);
  const reqItems = db
    .select({
      itemType: sales.itemType,
      nb: sum(sales.quantity).mapWith(Number),
      total: sum(sales.price),
    })
    .from(sales)
    .where(
      and(
        eq(sales.deleted, false),
        sql`${sales.created} >= ${monthStart}::date`,
        sql`${sales.created} < ${monthStart}::date + interval '1 month'`,
      ),
    )
    .groupBy(sales.itemType)
    .orderBy(({ nb }) => desc(nb));
  const [salesByDay, stats, itemTypes] = await Promise.all([
    reqSales,
    reqStats,
    reqItems,
  ]);
  return { salesByDay, stats, itemTypes };
};
