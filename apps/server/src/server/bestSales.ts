import { items, sales } from "@livrelibre/shared/schema";
import { db } from "@server/db/database";
import { type SQL, and, desc, eq, sql, sum } from "drizzle-orm";

export type BestSale = {
  id: number;
  title: string | null;
  author: string;
  amount: number;
  count: string | null;
};

export const getBestSales = async ({
  dateFrom,
  dateTo,
}: {
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
} = {}): Promise<BestSale[]> => {
  const conditions: (SQL | undefined)[] = [eq(sales.deleted, false)];
  if (dateFrom) {
    conditions.push(sql`${sales.created} >= ${dateFrom}::date`);
  }
  if (dateTo) {
    conditions.push(sql`${sales.created} < ${dateTo}::date + interval '1 day'`);
  }

  const bestSales = await db
    .select({
      id: items.id,
      title: items.title,
      author: items.author,
      amount: items.amount,
      count: sum(sales.quantity),
    })
    .from(sales)
    .innerJoin(items, eq(sales.itemId, items.id))
    .where(and(...conditions))
    .groupBy(items.id, items.title, items.author, items.amount)
    .orderBy(({ count }) => [desc(count), items.title])
    .limit(100);
  return bestSales;
};
