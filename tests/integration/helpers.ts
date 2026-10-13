import { db } from "@livrelibre/server/db/database";
import { DISCOUNT_ITEM_TYPE, DISCOUNT_ITEM_TYPE_LABEL, ITEM_TYPES } from "@livrelibre/shared/item";
import { customers, itemTypes, items, orders, sales, users } from "@livrelibre/shared/schema";
import { norm } from "@livrelibre/shared/utils";
import { type User } from "@server/auth";
import { sql } from "drizzle-orm";

import { getTestDatabaseUri } from "../test-db.mts";

export const TEST_USER: User = { id: 1, name: "admin", role: "admin" };

/** Insère les types d'article par défaut (réamorcés après chaque `truncateAll`). */
export const seedItemTypes = async () => {
  await db
    .insert(itemTypes)
    .values(
      Object.entries(ITEM_TYPES).map(([code, type], index) => ({
        code,
        label: type.label,
        tva: type.tva,
        position: index,
        active: true,
        isDefault: code === "book",
      })),
    )
    .onConflictDoNothing();
  await db
    .insert(itemTypes)
    .values({
      code: DISCOUNT_ITEM_TYPE,
      label: DISCOUNT_ITEM_TYPE_LABEL,
      tva: "5.5",
      position: 100,
      active: false,
      isDefault: false,
    })
    .onConflictDoNothing();
};

export const truncateAll = async () => {
  if (process.env.POSTGRES_URI !== getTestDatabaseUri()) {
    throw new Error(
      "Refusing to truncate: the active database is not the test database from .env.test.",
    );
  }
  await db.execute(
    sql`TRUNCATE TABLE "users", "items", "cart", "asideCart", "sales", "customers", "purchases", "selectedCustomer", "orders", "itemTypes" RESTART IDENTITY CASCADE`,
  );
  await seedItemTypes();
};

export const seedUser = async (overrides: Partial<typeof users.$inferInsert> = {}) => {
  const rows = await db
    .insert(users)
    .values({
      name: "admin",
      hash: "a".repeat(60),
      role: "admin",
      ...overrides,
    })
    .returning();
  return rows[0];
};

export const seedItem = async (overrides: Partial<typeof items.$inferInsert> = {}) => {
  const rows = await db
    .insert(items)
    .values({
      type: "book",
      isbn: "9780000000001",
      author: "Author",
      title: "Title",
      publisher: "Publisher",
      distributor: "Distributor",
      keywords: null,
      datebought: "2024-01-01",
      comments: null,
      price: "10.00",
      amount: 5,
      tva: "5.5",
      starred: false,
      nmAuthor: "author",
      nmTitle: "title",
      nmPublisher: "publisher",
      nmDistributor: "distributor",
      ...overrides,
    })
    .returning();
  return rows[0];
};

export const seedCustomer = async (overrides: Partial<typeof customers.$inferInsert> = {}) => {
  const rows = await db
    .insert(customers)
    .values({
      fullname: "John Doe",
      nmFullname: "john doe",
      contact: "",
      phone: null,
      email: null,
      comment: "",
      ...overrides,
    })
    .returning();
  return rows[0];
};

export const seedOrder = async (overrides: Partial<typeof orders.$inferInsert> = {}) => {
  const itemTitle = overrides.itemTitle ?? "Title";
  const rows = await db
    .insert(orders)
    .values({
      customerId: 1,
      itemTitle,
      nmTitle: norm(itemTitle),
      ordered: "new",
      customerNotified: false,
      paid: false,
      comment: "",
      nb: 1,
      contact: "unknown",
      ...overrides,
    })
    .returning();
  return rows[0];
};

export const seedSale = async (overrides: Partial<typeof sales.$inferInsert> = {}) => {
  const rows = await db
    .insert(sales)
    .values({
      itemType: "book",
      price: "10.00",
      quantity: 1,
      title: "Title",
      tva: "5.5",
      linkedToCustomer: false,
      deleted: false,
      paymentType: "cash",
      receiptId: 1,
      ...overrides,
    })
    .returning();
  return rows[0];
};
