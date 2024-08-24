import { format, sub } from "date-fns";
import { fr } from "date-fns/locale";
import { and, eq, lt, sql, sum } from "drizzle-orm";

import { db } from "@/db/database";
import { sales } from "@/db/schema";

export const lastSales = async (id: number) => {
  const lastSales = await db
    .select({
      month: sql`to_char(${sales.created}, 'YYYY-MM')`,
      count: sum(sales.quantity),
    })
    .from(sales)
    .where(
      and(
        eq(sales.itemId, id),
        eq(sales.deleted, false),
        lt(sql`extract(year from age(${sales.created}))`, 2),
      ),
    )
    .groupBy(({ month }) => month)
    .orderBy(({ month }) => month);

  /* lastSales only contains months with at least one sale. Need to add months with no sales. */
  const salesByMonth = [];
  let date = new Date();
  for (let i = 0; i < 24; i++) {
    const month = format(date, "yyyy-MM");
    const monthLabel = format(date, "MMM", { locale: fr });
    const fullMonthLabel = format(date, "MMMM yyyy", { locale: fr });
    const count = Number(lastSales.find((x) => x.month === month)?.count || 0);
    salesByMonth.push({ id: month, count, monthLabel, fullMonthLabel });
    date = sub(date, { months: 1 });
  }
  salesByMonth.reverse();
  return salesByMonth;
};
