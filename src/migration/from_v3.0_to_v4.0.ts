import { sql } from "drizzle-orm";
import { Db, MongoClient } from "mongodb";

import { db } from "@/db/database";
import {
  customers as customersTable,
  items as itemsTable,
  orders as ordersTable,
  purchases as purchasesTable,
  sales as salesTable,
  users as usersTable,
} from "@/db/schema";
import type { DBItem } from "@/utils/item";
import type { DBOrder } from "@/utils/order";
import type { DBSale } from "@/utils/sale";

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  console.error("Please provide MONGODB_URI env var");
  process.exit(1);
}

type Purchase = {
  date: string;
  amount: number;
};
type DBCustomer = {
  fullname: string;
  nmFullname: string;
  contact: string;
  phone?: string | undefined;
  email?: string | undefined;
  comment: string;
  purchases: Purchase[];
};

const SLICE_SIZE = 2_000;

const migrateUsers = async (mDB: Db) => {
  type DBUser = { name: string; hash: string; role: "admin" | "guest" };
  const users = await mDB.collection<DBUser>("users").find().toArray();
  if (users.length === 0) {
    console.log("No users to migrate.");
    return;
  }
  await db.insert(usersTable).values(users);
  const plural = users.length > 1 ? "s" : "";
  console.log(`${users.length} user${plural} updated.`);
};

const migrateItems = async (mDB: Db) => {
  const items = await mDB
    .collection<DBItem & { id: string }>("books")
    .find()
    .toArray();
  if (items.length === 0) {
    console.log("No items to migrate.");
    return;
  }
  const plural = items.length > 1 ? "s" : "";
  console.log(`Found ${items.length} item${plural}, updating…`);
  for (let i = 0; i < items.length; i += SLICE_SIZE) {
    console.log(i, i + SLICE_SIZE);
    const pgItems = items.slice(i, i + SLICE_SIZE).map((item) => {
      const { id, starred, ...pgItem } = item;
      return {
        ...pgItem,
        starred: Boolean(starred),
        _id: pgItem._id.toString(),
      };
    });
    await db.insert(itemsTable).values(pgItems);
  }
  console.log(`${items.length} item${plural} updated.`);
};

const migrateSales = async (mDB: Db) => {
  const sales = await mDB.collection<DBSale>("sales").find().toArray();
  if (sales.length === 0) {
    console.log("No sales to migrate.");
    return;
  }
  const plural = sales.length > 1 ? "s" : "";
  console.log(`Found ${sales.length} sale${plural}, updating…`);
  for (let i = 0; i < sales.length; i += SLICE_SIZE) {
    console.log(i, i + SLICE_SIZE);
    const pgSales = sales.slice(i, i + SLICE_SIZE).map((sale) => {
      const { _id, id, date, price, cartId, ...pgSale } = sale;
      const created = _id.getTimestamp();
      if (_id.getTimestamp().toLocaleDateString("fr") !== date) {
        const [day, month, year] = date.split("/").map(Number);
        created.setFullYear(year);
        created.setMonth(month - 1);
        created.setDate(day);
      }
      return {
        ...pgSale,
        created,
        price: String(price),
        cartId: cartId ? parseInt(cartId.toString().slice(-6), 16) : null,
        itemObjectId: sale.id ?? null,
        deleted: Boolean(sale.deleted),
        paymentType: sale.type ?? null,
        linkedToCustomer: Boolean(sale.linkedToCustomer),
      } satisfies typeof salesTable.$inferInsert;
    });
    await db.insert(salesTable).values(pgSales);
  }
  console.log(`${sales.length} item${plural} updated.`);
  const update = sql`UPDATE ${salesTable} SET "itemId" = ${itemsTable.id} FROM ${itemsTable} WHERE ${salesTable.itemObjectId} = ${itemsTable._id}`;
  await db.execute(update);
};

const migrateCustomers = async (mDb: Db) => {
  const customers = await mDb
    .collection<DBCustomer>("customers")
    .find()
    .toArray();
  if (customers.length === 0) {
    console.log("No customers to migrate.");
    return;
  }
  console.log(`Found ${customers.length} customers, updating…`);
  for (const customer of customers) {
    const { _id, phone, email, purchases, ...rest } = customer;
    const pgCustomer = {
      ...rest,
      phone: phone ?? null,
      email: email ?? null,
      _id: _id.toString(),
    };
    const rows = await db
      .insert(customersTable)
      .values(pgCustomer)
      .returning({ id: customersTable.id });
    if (purchases.length > 0) {
      const pgPurchases = purchases.map((p) => ({
        date: p.date,
        amount: String(p.amount),
        customerId: rows[0].id,
      }));
      await db.insert(purchasesTable).values(pgPurchases);
    }
  }
  console.log(`${customers.length} customers updated.`);
};

const migrateOrders = async (mDb: Db) => {
  const orders = await mDb.collection<DBOrder>("orders").find().toArray();
  if (orders.length === 0) {
    console.log("No orders to migrate.");
    return;
  }
  const pgOrders = orders.map((o) => ({
    ...o,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    customerObjectId: o.customerId!.toString(),
    customerId: null,
    itemObjectId: o.itemId?.toString() ?? null,
    itemId: null,
    created: o.date,
  }));
  // ALTER TABLE "orders" ALTER COLUMN "customerId" DROP NOT NULL;
  await db.insert(ordersTable).values(pgOrders);
  console.log(`${orders.length} orders updated.`);
  const updateItemIds = sql`UPDATE ${ordersTable} SET "itemId" = ${itemsTable.id} FROM ${itemsTable} WHERE ${ordersTable.itemObjectId} = ${itemsTable._id}`;
  await db.execute(updateItemIds);
  console.log("itemId updated");
  const updateCustomerIds = sql`UPDATE ${ordersTable} SET "customerId" = ${customersTable.id} FROM ${customersTable} WHERE ${ordersTable.customerObjectId} = "_id"`;
  await db.execute(updateCustomerIds);
  console.log("customerId updated");
  await db.execute(sql`DELETE FROM ${ordersTable} WHERE "customerId" IS NULL`);
  // ALTER TABLE "orders" ALTER COLUMN "customerId" SET NOT NULL;
  console.log("null customerId removed");
};

const main = async () => {
  const client = new MongoClient(MONGODB_URI);
  try {
    const mongoClient = await client.connect();
    const mDB = mongoClient.db();
    await migrateUsers(mDB);
    await migrateItems(mDB);
    await migrateSales(mDB);
    await migrateCustomers(mDB);
    await migrateOrders(mDB);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    void client.close();
  }
};

void main();
