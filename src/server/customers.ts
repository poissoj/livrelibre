import type { Filter, Sort } from "mongodb";

import { DBCustomer } from "@/utils/customer";
import { ITEMS_PER_PAGE } from "@/utils/pagination";

import { getDb } from "./database";

export const getCustomers = async ({
  query = {},
  sortParams = { name: 1 },
  pageNumber = 1,
}: {
  query?: Filter<DBCustomer>;
  sortParams?: Sort;
  pageNumber?: number;
}) => {
  const db = await getDb();
  const customersCollection = db.collection<DBCustomer>("customers");
  const countPromise = customersCollection.countDocuments(query);
  const itemsPromise = customersCollection
    .find(query)
    .sort(sortParams)
    .skip((pageNumber - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .toArray();
  const [count, dbItems] = await Promise.all([countPromise, itemsPromise]);
  const pageCount = Math.ceil(count / ITEMS_PER_PAGE);
  const items = dbItems.map((item) => ({
    ...item,
    _id: item._id.toString(),
  }));

  return { count, pageCount, items };
};
