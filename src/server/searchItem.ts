import type { Item, ItemWithCount } from "@/utils/item";
import { ObjectId } from "mongodb";
import { getDb } from "./database";

export const getItem = async (id: string): Promise<ItemWithCount | null> => {
  if (!/^[a-f\d]{24}$/i.test(id)) {
    throw new Error("Invalid id");
  }
  const _id = new ObjectId(id);
  const db = await getDb();
  const item = await db.collection<Item>("books").findOne({ _id });
  const salesCount = await db
    .collection("sales")
    .aggregate<{ total: number }>([
      { $match: { id: _id, deleted: { $exists: false } } },
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ])
    .toArray();
  const count = salesCount.length > 0 ? salesCount[0].total : 0;
  return item ? { ...item, count } : null;
};
