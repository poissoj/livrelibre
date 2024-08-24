import { and, desc, eq, sql, sum } from "drizzle-orm";

import { db } from "@/db/database";
import { sales } from "@/db/schema";

export const getSalesByMonth = async (month: string, year: string) => {
  const yearMonth = `${year}-${month}`;
  const reqSales = db
    .select({
      date: sql<string>`to_char(${sales.created}, 'YYYY-MM-dd')`,
      count: sum(sales.quantity).mapWith(Number),
      total: sum(sales.price),
    })
    .from(sales)
    .where(
      and(
        eq(sales.deleted, false),
        sql`to_char(${sales.created}, 'YYYY-MM') = ${yearMonth}`,
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
        sql`to_char(${sales.created}, 'YYYY-MM') = ${yearMonth}`,
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
        sql`to_char(${sales.created}, 'YYYY-MM') = ${yearMonth}`,
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
