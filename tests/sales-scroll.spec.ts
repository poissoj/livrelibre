import { expect, test } from "@playwright/test";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { items, sales } from "@livrelibre/shared/schema";

import { E2E_USER } from "./e2e-user";
import { getTestDatabaseUri } from "./test-db.mts";

const databaseUrl = getTestDatabaseUri();
const seed = Math.floor(Math.random() * 3000);
const baseDate = new Date(Date.UTC(2021, 0, 1));
baseDate.setUTCDate(baseDate.getUTCDate() + seed);
const year = baseDate.getUTCFullYear();
const month = String(baseDate.getUTCMonth() + 1).padStart(2, "0");
const day = String(baseDate.getUTCDate()).padStart(2, "0");
const isbn = String(Math.floor(Math.random() * 1e12)).padStart(12, "0");
const itemTitle = `Livre scroll E2E ${isbn}`;
const saleDate = `${year}-${month}-${day}`;
const salePath = `/sale/${year}/${month}/${day}`;
const cartId = Math.floor(Math.random() * 1e9) + 1;
const salesCount = 60;

let itemId: number | undefined;

test.beforeAll(async () => {
  const client = postgres(databaseUrl);
  const db = drizzle(client);

  const [item] = await db
    .insert(items)
    .values({
      type: "book",
      isbn,
      author: "Auteur scroll E2E",
      title: itemTitle,
      publisher: "Editeur scroll E2E",
      distributor: "Distributeur scroll E2E",
      keywords: null,
      datebought: "2024-01-01",
      comments: null,
      price: "10.00",
      amount: salesCount,
      tva: "5.5",
      starred: false,
      nmAuthor: "auteur scroll e2e",
      nmTitle: "livre scroll e2e",
      nmPublisher: "editeur scroll e2e",
      nmDistributor: "distributeur scroll e2e",
    })
    .returning();
  itemId = item.id;

  await db.insert(sales).values(
    Array.from({ length: salesCount }, () => ({
      itemType: "book" as const,
      price: "10.00",
      quantity: 1,
      title: itemTitle,
      created: new Date(`${saleDate}T12:00:00Z`),
      tva: "5.5" as const,
      linkedToCustomer: false,
      itemId: item.id,
      cartId,
      deleted: false,
      paymentType: "cash" as const,
    })),
  );

  await client.end();
});

test.afterAll(async () => {
  const client = postgres(databaseUrl);
  const db = drizzle(client);

  await db
    .delete(sales)
    .where(
      sql`CAST(${sales.created} AS date) = ${saleDate} AND ${sales.cartId} = ${cartId}`,
    );
  if (itemId != null) {
    await db.delete(items).where(eq(items.id, itemId));
  }

  await client.end();
});

test("conserve la position de scroll de la liste des ventes du jour", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Identifiant").fill(E2E_USER.name);
  await page.getByLabel("Mot de passe").fill(E2E_USER.password);
  await page.getByRole("button", { name: "Connexion" }).click();
  await expect(page).toHaveURL("/");

  await page.goto(salePath);
  const itemLinks = page.getByRole("link", { name: itemTitle });
  await expect(itemLinks).toHaveCount(salesCount);

  const scroller = page.locator("main div.overflow-auto").first();
  await expect(scroller).toBeVisible();

  const expectedTop = await scroller.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
    return el.scrollTop;
  });
  expect(expectedTop).toBeGreaterThan(0);

  await itemLinks.last().click();
  // Let the item page fully render, so that the sales page is really unmounted.
  await expect(page).toHaveURL(/\/item\/\d+/);
  await expect(page.getByText("Ventes des 2 dernières années")).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(salePath);
  await expect(itemLinks).toHaveCount(salesCount);

  await expect
    .poll(() => scroller.evaluate((el) => el.scrollTop))
    .toBe(expectedTop);
});
