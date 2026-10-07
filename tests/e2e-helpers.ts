import { type Page, expect } from "@playwright/test";
import bcrypt from "bcrypt";
import { eq, inArray, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import {
  asideCart,
  cart,
  customers,
  items,
  orders,
  purchases,
  sales,
  selectedCustomer,
  users,
} from "@livrelibre/shared/schema";
import { norm } from "@livrelibre/shared/utils";

import { E2E_USER } from "./e2e-user";
import { getTestDatabaseUri } from "./test-db.mts";

const databaseUrl = getTestDatabaseUri();

let isbnSequence = 0;

const withDb = async <T>(
  fn: (db: ReturnType<typeof drizzle>) => Promise<T>,
): Promise<T> => {
  const client = postgres(databaseUrl);
  try {
    return await fn(drizzle(client));
  } finally {
    await client.end();
  }
};

/** Unique, sortable prefix (leading "000" keeps seeded rows on the first page). */
export const unique = (prefix: string): string =>
  `000 ${prefix} ${String(Date.now())}`;

export const uniqueIsbn = (): string => {
  isbnSequence = (isbnSequence + 1) % 10;
  return `${String(Date.now()).slice(-12)}${String(isbnSequence)}`;
};

export const login = async (
  page: Page,
  user: { name: string; password: string } = E2E_USER,
): Promise<void> => {
  await page.goto("/login");
  await page.getByLabel("Identifiant").fill(user.name);
  await page.getByLabel("Mot de passe").fill(user.password);
  await page.getByRole("button", { name: "Connexion" }).click();
  await expect(page).toHaveURL("/");
};

export const seedItem = async (
  overrides: Partial<typeof items.$inferInsert> = {},
) =>
  withDb(async (db) => {
    const author = overrides.author ?? "Auteur E2E";
    const title = overrides.title ?? "Article E2E";
    const publisher = overrides.publisher ?? "Éditeur E2E";
    const distributor = overrides.distributor ?? "Distributeur E2E";
    const [row] = await db
      .insert(items)
      .values({
        type: "book",
        isbn: uniqueIsbn(),
        keywords: null,
        datebought: "2024-01-01",
        comments: null,
        price: "10.00",
        amount: 5,
        tva: "5.5",
        starred: false,
        author,
        title,
        publisher,
        distributor,
        ...overrides,
        nmAuthor: overrides.nmAuthor ?? norm(author),
        nmTitle: overrides.nmTitle ?? norm(title),
        nmPublisher: overrides.nmPublisher ?? norm(publisher),
        nmDistributor: overrides.nmDistributor ?? norm(distributor),
      })
      .returning();
    return row;
  });

export const deleteItem = async (id: number): Promise<void> =>
  withDb(async (db) => {
    await db.delete(items).where(eq(items.id, id));
  });

/** Bulk-seeds `count` items (single insert) with unique ISBNs and titles. */
export const seedItems = async (
  count: number,
  overrides: Partial<typeof items.$inferInsert> = {},
) =>
  withDb(async (db) => {
    const author = overrides.author ?? "Auteur E2E";
    const title = overrides.title ?? "Article E2E";
    const publisher = overrides.publisher ?? "Éditeur E2E";
    const distributor = overrides.distributor ?? "Distributeur E2E";
    const isbnPrefix = String(Date.now()).slice(-10);
    const values = Array.from({ length: count }, (_, i) => {
      const rowTitle = `${title} ${String(i)}`;
      return {
        type: "book" as const,
        keywords: null,
        datebought: "2024-01-01",
        comments: null,
        price: "10.00",
        amount: 5,
        tva: "5.5" as const,
        starred: false,
        author,
        publisher,
        distributor,
        ...overrides,
        isbn: `${isbnPrefix}${String(i).padStart(3, "0")}`,
        title: rowTitle,
        nmAuthor: overrides.nmAuthor ?? norm(author),
        nmTitle: overrides.nmTitle ?? norm(rowTitle),
        nmPublisher: overrides.nmPublisher ?? norm(publisher),
        nmDistributor: overrides.nmDistributor ?? norm(distributor),
      };
    });
    return await db.insert(items).values(values).returning();
  });

export const deleteItemsByTitleLike = async (pattern: string): Promise<void> =>
  withDb(async (db) => {
    await db.delete(items).where(like(items.title, pattern));
  });

export const seedCustomer = async (
  overrides: Partial<typeof customers.$inferInsert> = {},
) =>
  withDb(async (db) => {
    const fullname = overrides.fullname ?? "Client E2E";
    const [row] = await db
      .insert(customers)
      .values({
        fullname,
        contact: "",
        phone: null,
        email: null,
        comment: "",
        ...overrides,
        nmFullname: overrides.nmFullname ?? norm(fullname),
      })
      .returning();
    return row;
  });

export const deleteCustomer = async (id: number): Promise<void> =>
  withDb(async (db) => {
    await db
      .delete(selectedCustomer)
      .where(eq(selectedCustomer.customerId, id));
    await db.delete(purchases).where(eq(purchases.customerId, id));
    await db.delete(orders).where(eq(orders.customerId, id));
    await db.delete(customers).where(eq(customers.id, id));
  });

export const deleteCustomersByFullnameLike = async (
  pattern: string,
): Promise<void> =>
  withDb(async (db) => {
    const rows = await db
      .select({ id: customers.id })
      .from(customers)
      .where(like(customers.fullname, pattern));
    const ids = rows.map((row) => row.id);
    if (ids.length === 0) return;
    await db
      .delete(selectedCustomer)
      .where(inArray(selectedCustomer.customerId, ids));
    await db.delete(purchases).where(inArray(purchases.customerId, ids));
    await db.delete(orders).where(inArray(orders.customerId, ids));
    await db.delete(customers).where(inArray(customers.id, ids));
  });

export const seedOrder = async (
  overrides: Partial<typeof orders.$inferInsert> = {},
) =>
  withDb(async (db) => {
    const [row] = await db
      .insert(orders)
      .values({
        customerId: 1,
        itemTitle: "Article E2E",
        ordered: "new",
        customerNotified: false,
        paid: false,
        comment: "",
        nb: 1,
        contact: "unknown",
        ...overrides,
      })
      .returning();
    return row;
  });

export const deleteOrder = async (id: number): Promise<void> =>
  withDb(async (db) => {
    await db.delete(orders).where(eq(orders.id, id));
  });

export const seedSale = async (
  overrides: Partial<typeof sales.$inferInsert> = {},
) =>
  withDb(async (db) => {
    const [row] = await db
      .insert(sales)
      .values({
        itemType: "book",
        price: "10.00",
        quantity: 1,
        title: "Article E2E",
        tva: "5.5",
        linkedToCustomer: false,
        deleted: false,
        paymentType: "cash",
        cartId: 0,
        ...overrides,
      })
      .returning();
    return row;
  });

export const deleteSale = async (id: number): Promise<void> =>
  withDb(async (db) => {
    await db.delete(sales).where(eq(sales.id, id));
  });

export const deleteSalesByItemId = async (itemId: number): Promise<void> =>
  withDb(async (db) => {
    await db.delete(sales).where(eq(sales.itemId, itemId));
  });

export const deleteSalesByTitleLike = async (pattern: string): Promise<void> =>
  withDb(async (db) => {
    await db.delete(sales).where(like(sales.title, pattern));
  });

/** Clears every user's cart/aside-cart/selected customer. */
export const clearCart = async (): Promise<void> =>
  withDb(async (db) => {
    await db.delete(cart);
    await db.delete(asideCart);
    await db.delete(selectedCustomer);
  });

export const seedCashier = async (): Promise<{
  name: string;
  password: string;
}> => {
  const name = unique("cashier");
  const password = "cashier";
  const hash = await bcrypt.hash(password, 12);
  await withDb(async (db) => {
    await db.insert(users).values({ name, hash, role: "cashier" });
  });
  return { name, password };
};

export const deleteUser = async (name: string): Promise<void> =>
  withDb(async (db) => {
    const rows = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.name, name));
    const ids = rows.map((row) => row.id);
    if (ids.length === 0) return;
    await db.delete(cart).where(inArray(cart.userId, ids));
    await db.delete(asideCart).where(inArray(asideCart.userId, ids));
    await db
      .delete(selectedCustomer)
      .where(inArray(selectedCustomer.userId, ids));
    await db.delete(users).where(inArray(users.id, ids));
  });
