import { Item } from "@/utils/item";
import { ObjectId } from "mongodb";
import { getDb } from "./database";

export const getItem = async (id: string): Promise<Item | null> => {
  if (!/^[a-f\d]{24}$/i.test(id)) {
    throw new Error("Invalid id");
  }
  const db = await getDb();
  const item = await db
    .collection<Item>("books")
    .findOne({ _id: new ObjectId(id) });
  return item;
};
