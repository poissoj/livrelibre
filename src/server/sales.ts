import { getDb } from "@/server/database";

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
});

const sortSales = (s1: Sale, s2: Sale) => {
  const month1 = s1.month.split("/");
  const month2 = s2.month.split("/");
  const year = -month1[1].localeCompare(month2[1]);
  if (year) {
    return year;
  }
  return -month1[0].localeCompare(month2[0]);
};

export const getSales = async (): Promise<Sale[]> => {
  const db = await getDb();
  const dbSales = await db
    .collection("sales")
    .aggregate<DBSale>([
      { $match: { deleted: { $exists: false } } },
      {
        $group: {
          _id: { month: { $substr: ["$date", 3, 7] } },
          amount: { $sum: "$price" },
          ht: {
            $sum: {
              $divide: [
                { $multiply: ["$price", 100] },
                { $add: [100, { $toDouble: "$tva" }] },
              ],
            },
          },
          count: { $sum: "$quantity" },
          carts: { $addToSet: "$cartId" },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id.month",
          amount: 1,
          ht: 1,
          count: 1,
          carts: { $size: "$carts" },
        },
      },
    ])
    .toArray();
  const sales = dbSales.map(toSale);
  sales.sort(sortSales);
  return sales;
};
