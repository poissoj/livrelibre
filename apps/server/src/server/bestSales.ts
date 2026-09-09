import { desc, eq, sum } from "drizzle-orm";

import { items, sales } from "@livrelibre/shared/schema";

import { db } from "@server/db/database";

export type BestSale = {
  id: number;
  title: string | null;
  author: string;
  amount: number;
  count: string | null;
};

export const getBestSales = async (): Promise<BestSale[]> => {
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
    .where(eq(sales.deleted, false))
    .groupBy(items.id, items.title, items.author, items.amount)
    .orderBy(({ count }) => [desc(count), items.title])
    .limit(100);
  return bestSales;
};
