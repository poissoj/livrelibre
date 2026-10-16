import { sales } from "@livrelibre/shared/schema";
import { db } from "@server/db/database";
import { and, count, eq, sql } from "drizzle-orm";

export const getStats = async (): Promise<{
  hours: { hour: number; count: number }[];
  days: { day: number; count: number }[];
}> => {
  const hours = await db
    .select({
      hour: sql`extract(hour from ${sales.soldAt})`.mapWith(Number),
      count: count(),
    })
    .from(sales)
    .where(
      and(
        eq(sales.deleted, false),
        // Only sales recorded on the day they happened carry a meaningful hour;
        // backdated sales are stored at local midnight and would skew the histogram.
        sql`${sales.soldAt}::date = ${sales.created}::date`,
      ),
    )
    .groupBy(({ hour }) => hour)
    .having(sql`extract(hour from ${sales.soldAt}) between 8 and 21`)
    .orderBy(({ hour }) => hour);
  const days = await db
    .select({
      day: sql`extract(dow from ${sales.soldAt})`.mapWith(Number),
      count: count(),
    })
    .from(sales)
    .where(eq(sales.deleted, false))
    .groupBy(({ day }) => day)
    .orderBy(({ day }) => day);
  return { hours, days };
};
