import { expect, test } from "@playwright/test";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { items } from "@livrelibre/shared/schema";

config({ path: ".env.local" });
const databaseUrl = process.env.TEST_POSTGRES_URI ?? process.env.POSTGRES_URI;
const { USER_NAME, USER_PASSWORD } = process.env;

const isbn = String(Date.now());
const originalTitle = "Titre E2E avant";
const updatedTitle = "Titre E2E après";
let itemId: number | undefined;

test.beforeAll(async () => {
  if (!databaseUrl) {
    throw new Error("No test database URI configured (TEST_POSTGRES_URI)");
  }
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
      datebought: "01/01/2024",
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
  if (itemId == null || !databaseUrl) return;
  const client = postgres(databaseUrl);
  const db = drizzle(client);
  await db.delete(items).where(eq(items.id, itemId));
  await client.end();
});

test("met à jour un article", async ({ page }) => {
  if (!USER_NAME || !USER_PASSWORD) {
    test.skip(true, "USER_NAME / USER_PASSWORD absents du .env.local");
    return;
  }
  if (itemId == null) {
    throw new Error("Article de test non créé");
  }

  await page.goto("/login");
  await page.getByLabel("Identifiant").fill(USER_NAME);
  await page.getByLabel("Mot de passe").fill(USER_PASSWORD);
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
