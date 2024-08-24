import { count, eq, sql } from "drizzle-orm";

import { db } from "@/db/database";
import { sales } from "@/db/schema";

export const getStats = async (): Promise<{
  hours: { hour: number; count: number }[];
  days: { day: number; count: number }[];
}> => {
  const hours = await db
    .select({
      hour: sql`extract(hour from ${sales.created})`.mapWith(Number),
      count: count(),
    })
    .from(sales)
    .where(eq(sales.deleted, false))
    .groupBy(({ hour }) => hour)
    .having(sql`extract(hour from ${sales.created}) between 8 and 21`)
    .orderBy(({ hour }) => hour);
  const days = await db
    .select({
      day: sql`extract(dow from ${sales.created})`.mapWith(Number),
      count: count(),
    })
    .from(sales)
    .where(eq(sales.deleted, false))
    .groupBy(({ day }) => day)
    .orderBy(({ day }) => day);
  return { hours, days };
};
