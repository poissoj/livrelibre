import type { Filter, Sort } from "mongodb";

import type { DBItem, Item } from "@/utils/item";
import { ITEMS_PER_PAGE } from "@/utils/pagination";

import { getDb } from "./database";

export const getItems = async (
  query: Filter<DBItem> = {},
  sortParams: Sort = { title: 1 },
  pageNumber = 1
) => {
  const db = await getDb();
  const itemCollection = db.collection<DBItem>("books");
  const countPromise = itemCollection.countDocuments(query);
  const itemsPromise = itemCollection
    .find(query)
    .sort(sortParams)
    .skip((pageNumber - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .toArray();
  const [count, dbItems] = await Promise.all([countPromise, itemsPromise]);
  const pageCount = Math.ceil(count / ITEMS_PER_PAGE);
  const items: Item[] = dbItems.map((item) => ({
    ...item,
    _id: item._id.toString(),
  }));

  return { count, pageCount, items };
};
