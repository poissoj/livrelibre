import { countDistinct, desc, eq, sql, sum } from "drizzle-orm";

import { db } from "@/db/database";
import { sales } from "@/db/schema";

type DBSale = {
  month: string;
  count: number;
  amount: number;
  ht: number;
  carts: number;
};

export type Sale = DBSale & {
  avg: number;
};

const toSale = (dbSale: DBSale): Sale => ({
  ...dbSale,
  avg: Number((dbSale.amount / dbSale.carts).toFixed(2)),
  month: dbSale.month.split("-").reverse().join("/"),
});

export const getSales = async (): Promise<Sale[]> => {
  const dbSales = await db
    .select({
      month: sql<string>`to_char(${sales.created}, 'YYYY-MM')`,
      amount: sum(sales.price).mapWith(Number),
      count: sum(sales.quantity).mapWith(Number),
      ht: sql`round(sum((${sales.price} * 100) / (100 + ${sales.tva}::TEXT::numeric)), 2)`.mapWith(
        Number,
      ),
      carts: countDistinct(sales.cartId),
    })
    .from(sales)
    .where(eq(sales.deleted, false))
    .groupBy(({ month }) => month)
    .orderBy(({ month }) => desc(month));
  return dbSales.map(toSale);
};
