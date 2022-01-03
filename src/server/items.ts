import type { Item } from "@/utils/item";
import type { Filter, Sort } from "mongodb";
import { getDb } from "./database";

const ITEMS_PER_PAGE = 50;

export const getItems = async (
  query: Filter<Item> = {},
  sortParams: Sort = { title: 1 },
  pageNumber = 1
) => {
  const db = await getDb();
  const itemCollection = db.collection<Item>("books");
  const countPromise = itemCollection.countDocuments(query);
  const itemsPromise = itemCollection
    .find(query)
    .sort(sortParams)
    .skip((pageNumber - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .toArray();
  const [count, items] = await Promise.all([countPromise, itemsPromise]);
  const pageCount = Math.ceil(count / ITEMS_PER_PAGE);

  return { count, pageCount, items };
};
