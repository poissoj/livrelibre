import { type Filter, ObjectId, type Sort } from "mongodb";

import { DBCustomer } from "@/utils/customer";
import { formatDate } from "@/utils/date";
import { logger } from "@/utils/logger";
import { ITEMS_PER_PAGE } from "@/utils/pagination";

import { getDb } from "./database";

export const getCustomers = async ({
  sortParams = { lastname: 1, firstname: 1 },
  pageNumber = 1,
  fullname,
}: {
  sortParams?: Sort;
  pageNumber?: number;
  fullname?: string | undefined;
}) => {
  const query: Filter<DBCustomer> = {};
  if (fullname) {
    query.fullname = new RegExp(fullname, "i");
  }
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

const MAX_CUSTOMERS_TO_DISPLAY = 10;
export const searchCustomers = async (search: string) => {
  if (search.length < 2) {
    return [];
  }
  const searchReg = new RegExp(search.toLowerCase(), "i");
  const db = await getDb();
  return await db
    .collection<DBCustomer>("customers")
    .find({ fullname: searchReg })
    .sort({ lastname: 1 })
    .limit(MAX_CUSTOMERS_TO_DISPLAY)
    .toArray();
};

export const resetCustomer = async (id: string) => {
  const db = await getDb();
  return await db
    .collection<DBCustomer>("customers")
    .updateOne({ _id: new ObjectId(id) }, { $set: { purchases: [] } });
};

export const addPurchase = async (customerId: string, amount: number) => {
  const date = formatDate(new Date()).split("-").reverse().join("/");
  const db = await getDb();
  return await db
    .collection<DBCustomer>("customers")
    .updateOne(
      { _id: new ObjectId(customerId) },
      { $push: { purchases: { amount, date } } },
    );
};

export type SelectedCustomer = {
  customerId: string | null;
  username: string;
  asideCart: boolean;
};

export const getSelectedCustomer = async (
  username: string,
  asideCart: boolean,
) => {
  const db = await getDb();
  return await db
    .collection<SelectedCustomer>("selectedCustomer")
    .findOne({ username, asideCart });
};

export const setSelectedCustomer = async (customer: SelectedCustomer) => {
  const db = await getDb();
  return await db
    .collection<SelectedCustomer>("selectedCustomer")
    .replaceOne({ username: customer.username }, customer, { upsert: true });
};

export const getCustomer = async (id: string) => {
  const db = await getDb();
  return await db
    .collection<DBCustomer>("customers")
    .findOne({ _id: new ObjectId(id) });
};

export const deleteCustomer = async (customerId: string) => {
  try {
    const db = await getDb();
    await db
      .collection<DBCustomer>("customers")
      .deleteOne({ _id: new ObjectId(customerId) });
    return { type: "success" as const, msg: "Le client a été supprimé" };
  } catch (error) {
    logger.error(error);
    return { type: "error" as const, msg: "Impossible de supprimer le client" };
  }
};

export const setCustomer = async (
  customerData: Pick<
    DBCustomer,
    "firstname" | "lastname" | "contact" | "comment"
  >,
  id: string,
) => {
  const db = await getDb();
  const fullname = `${customerData.firstname} ${customerData.lastname}`;
  const customer: Omit<DBCustomer, "purchases" | "total"> = {
    ...customerData,
    fullname,
  };
  try {
    await db
      .collection<DBCustomer>("customers")
      .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: customer });
    return { type: "success" as const, msg: "Le client a été modifié" };
  } catch (error) {
    logger.error(error);
    return { type: "error" as const, msg: "Impossible de modifier le client" };
  }
};

export const newCustomer = async (
  customerData: Pick<
    DBCustomer,
    "firstname" | "lastname" | "contact" | "comment"
  >,
) => {
  const db = await getDb();
  const fullname = `${customerData.firstname} ${customerData.lastname}`;
  const customer: DBCustomer = {
    ...customerData,
    fullname,
    purchases: [],
    total: 0,
  };
  try {
    await db.collection<DBCustomer>("customers").insertOne(customer);
    return { type: "success" as const, msg: "Le client a été ajouté" };
  } catch (error) {
    logger.error(error);
    return { type: "error" as const, msg: "Impossible d'ajouter le client" };
  }
};
