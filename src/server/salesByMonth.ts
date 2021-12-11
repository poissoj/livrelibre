import { format, sub } from "date-fns";
import { fr } from "date-fns/locale";
import { ObjectId } from "mongodb";
import { getDb } from "./database";

export const getSalesByMonth = async (_id: string) => {
  if (!/^[a-f\d]{24}$/i.test(_id)) {
    throw new Error("Invalid id");
  }
  const id = new ObjectId(_id);
  const db = await getDb();
  const lastSales = await db
    .collection("sales")
    .aggregate<{ _id: string; total: number }>([
      { $match: { id, deleted: { $exists: false } } },
      {
        $project: {
          month: { $substr: ["$date", 3, 2] },
          year: { $substr: ["$date", 6, 4] },
          quantity: 1,
        },
      },
      {
        $project: { date: { $concat: ["$year", "-", "$month"] }, quantity: 1 },
      },
      { $group: { _id: "$date", total: { $sum: "$quantity" } } },
      { $sort: { _id: -1 } },
      { $limit: 24 },
    ])
    .toArray();

  /* lastSales only contains months with at least one sale. Need to add months with no sales. */
  const salesByMonth = [];
  let date = new Date();
  for (let i = 0; i < 24; i++) {
    const id = format(date, "yyyy-MM");
    const monthLabel = format(date, "MMM", { locale: fr });
    const fullMonthLabel = format(date, "MMMM yyyy", { locale: fr });
    const count = lastSales.find((x) => x._id === id)?.total || 0;
    salesByMonth.push({ id, count, monthLabel, fullMonthLabel });
    date = sub(date, { months: 1 });
  }
  salesByMonth.reverse();
  return salesByMonth;
};
