import { sql } from "drizzle-orm";

import { db } from "@livrelibre/server/db/database";
import { customers, items, sales, users } from "@livrelibre/shared/schema";

export const truncateAll = async () => {
  await db.execute(
    sql`TRUNCATE TABLE "users", "items", "cart", "asideCart", "sales", "customers", "purchases", "selectedCustomer", "orders" RESTART IDENTITY CASCADE`,
  );
};

export const seedUser = async (
  overrides: Partial<typeof users.$inferInsert> = {},
) => {
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

export const seedItem = async (
  overrides: Partial<typeof items.$inferInsert> = {},
) => {
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
      datebought: "01/01/2024",
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

export const seedCustomer = async (
  overrides: Partial<typeof customers.$inferInsert> = {},
) => {
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

export const seedSale = async (
  overrides: Partial<typeof sales.$inferInsert> = {},
) => {
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
      cartId: 0,
      ...overrides,
    })
    .returning();
  return rows[0];
};
