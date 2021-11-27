import { getDb } from "@/server/database";
import { Item } from "@/utils/item";
import { ObjectId } from "mongodb";

export const getBestSales = async () => {
  const db = await getDb();
  const sales = await db
    .collection("sales")
    .aggregate<{ _id: ObjectId; count: number }>([
      { $match: { deleted: { $exists: false }, id: { $ne: null } } },
      { $group: { _id: "$id", count: { $sum: "$quantity" } } },
      { $sort: { count: -1 } },
      { $limit: 100 },
    ])
    .toArray();
  const items = await db
    .collection<Item>("books")
    .find({ _id: { $in: sales.map((sale) => sale._id) } })
    .toArray();
  const bestSales = items.map((item) => {
    let i = 0;
    while (!sales[i]._id.equals(item._id)) {
      i++;
    }
    return { ...item, count: sales[i].count };
  });
  bestSales.sort((i1, i2) => i2.count - i1.count);
  return bestSales;
};
