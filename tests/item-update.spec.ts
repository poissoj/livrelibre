import { expect, test } from "@playwright/test";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { items } from "@livrelibre/shared/schema";

import { E2E_USER } from "./e2e-user";
import { getTestDatabaseUri } from "./test-db.mts";

const databaseUrl = getTestDatabaseUri();

const isbn = String(Date.now());
const originalTitle = "Titre E2E avant";
const updatedTitle = "Titre E2E après";
let itemId: number | undefined;

test.beforeAll(async () => {
  const client = postgres(databaseUrl);
  const db = drizzle(client);
  const [row] = await db
    .insert(items)
    .values({
      type: "book",
      isbn,
      author: "Auteur E2E",
      title: originalTitle,
      publisher: "Éditeur E2E",
      distributor: "Distributeur E2E",
      keywords: null,
      datebought: "2024-01-01",
      comments: null,
      price: "10.00",
      amount: 5,
      tva: "5.5",
      starred: false,
      nmAuthor: "auteur e2e",
      nmTitle: "titre e2e avant",
      nmPublisher: "editeur e2e",
      nmDistributor: "distributeur e2e",
    })
    .returning();
  itemId = row.id;
  await client.end();
});

test.afterAll(async () => {
  if (itemId == null) return;
  const client = postgres(databaseUrl);
  const db = drizzle(client);
  await db.delete(items).where(eq(items.id, itemId));
  await client.end();
});

test("met à jour un article", async ({ page }) => {
  if (itemId == null) {
    throw new Error("Article de test non créé");
  }

  await page.goto("/login");
  await page.getByLabel("Identifiant").fill(E2E_USER.name);
  await page.getByLabel("Mot de passe").fill(E2E_USER.password);
  await page.getByRole("button", { name: "Connexion" }).click();
  await expect(page).toHaveURL("/");

  await page.goto(`/item/${itemId}`);
  await page.getByRole("link", { name: "Modifier" }).click();
  await expect(page).toHaveURL(`/update/${itemId}`);

  await page.getByLabel("Titre").fill(updatedTitle);
  await page.getByRole("button", { name: "Modifier" }).click();

  await expect(page).toHaveURL(`/item/${itemId}?status=updated`);
  await expect(page.getByText(`${updatedTitle} modifié.`)).toBeVisible();
  await expect(
    page.getByText(updatedTitle, { exact: true }).first(),
  ).toBeVisible();
});
