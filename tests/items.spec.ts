import { expect, test } from "@playwright/test";

import { clearCart, deleteItem, login, seedItem, unique } from "./e2e-helpers";

let item: Awaited<ReturnType<typeof seedItem>>;

test.beforeAll(async () => {
  await clearCart();
  item = await seedItem({ title: unique("Article liste") });
});

test.afterAll(async () => {
  await clearCart();
  await deleteItem(item.id);
});

test("Liste des articles vers la fiche article et ajout au panier", async ({ page }) => {
  await login(page);

  await page.goto("/items");
  await expect(page.getByRole("columnheader", { name: "Titre", exact: true })).toBeVisible();

  await page.getByRole("link", { name: item.title }).click();
  await expect(page).toHaveURL(`/item/${String(item.id)}`);
  await expect(page.getByText("Prix de vente")).toBeVisible();

  await page.getByRole("button", { name: "Ajouter au panier" }).click();
  await expect(page.getByTitle("Voir le panier")).toContainText("1");

  await page.goto("/cart");
  await expect(page.getByText("Panier - 1 article")).toBeVisible();
});
