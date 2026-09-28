import { expect, test } from "@playwright/test";
import { eq, inArray, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import {
  cart,
  customers,
  items,
  purchases,
  selectedCustomer,
  users,
} from "@livrelibre/shared/schema";

import { E2E_USER } from "./e2e-user";
import { getTestDatabaseUri } from "./test-db.mts";

const databaseUrl = getTestDatabaseUri();
const isbn = String(Date.now());
const customerName = "Client Fidelite E2E";
let customerId: number | undefined;
let itemId: number | undefined;

test.beforeAll(async () => {
  const client = postgres(databaseUrl);
  const db = drizzle(client);

  const userRows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.name, E2E_USER.name));
  const userId = userRows[0]?.id;
  if (userId) {
    await db.delete(cart).where(eq(cart.userId, userId));
    await db
      .delete(selectedCustomer)
      .where(eq(selectedCustomer.userId, userId));
  }

  // Remove leftovers from previous runs so the combobox stays unambiguous.
  const stale = await db
    .select({ id: customers.id })
    .from(customers)
    .where(like(customers.fullname, `${customerName}%`));
  const staleIds = stale.map((row) => row.id);
  if (staleIds.length > 0) {
    await db
      .delete(selectedCustomer)
      .where(inArray(selectedCustomer.customerId, staleIds));
    await db.delete(purchases).where(inArray(purchases.customerId, staleIds));
    await db.delete(customers).where(inArray(customers.id, staleIds));
  }

  const [customer] = await db
    .insert(customers)
    .values({
      fullname: customerName,
      nmFullname: "client fidelite e2e",
      contact: "",
      phone: null,
      email: null,
      comment: "",
    })
    .returning();
  customerId = customer.id;
  await db.insert(purchases).values({
    date: "01/01/2024",
    amount: "100.00",
    customerId: customer.id,
  });

  const [item] = await db
    .insert(items)
    .values({
      type: "book",
      isbn,
      author: "Auteur E2E",
      title: "Livre fidelite E2E",
      publisher: "Editeur E2E",
      distributor: "Distributeur E2E",
      keywords: null,
      datebought: "01/01/2024",
      comments: null,
      price: "10.00",
      amount: 5,
      tva: "5.5",
      starred: false,
      nmAuthor: "auteur e2e",
      nmTitle: "livre fidelite e2e",
      nmPublisher: "editeur e2e",
      nmDistributor: "distributeur e2e",
    })
    .returning();
  itemId = item.id;

  await client.end();
});

test.afterAll(async () => {
  const client = postgres(databaseUrl);
  const db = drizzle(client);
  const userRows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.name, E2E_USER.name));
  const userId = userRows[0]?.id;
  if (userId) {
    await db.delete(cart).where(eq(cart.userId, userId));
    await db
      .delete(selectedCustomer)
      .where(eq(selectedCustomer.userId, userId));
  }
  if (customerId != null) {
    await db.delete(purchases).where(eq(purchases.customerId, customerId));
    await db.delete(customers).where(eq(customers.id, customerId));
  }
  if (itemId != null) {
    await db.delete(items).where(eq(items.id, itemId));
  }
  await client.end();
});

test("applique la remise fidélité au panier", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Identifiant").fill(E2E_USER.name);
  await page.getByLabel("Mot de passe").fill(E2E_USER.password);
  await page.getByRole("button", { name: "Connexion" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/cart");
  await page.getByLabel("Ajout rapide").fill(isbn);
  await page.getByLabel("Ajout rapide").press("Enter");
  await expect(page.getByText("Panier - 1 article")).toBeVisible();

  await page.getByPlaceholder(/Associer/).click();
  await page.getByPlaceholder(/Associer/).fill("Fidelite");
  await page.getByRole("option", { name: customerName }).click();

  await page.getByRole("button", { name: "Appliquer" }).click();
  await expect(page.getByText("Remise carte de fidélité")).toBeVisible();
});
