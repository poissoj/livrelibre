import { expect, test } from "@playwright/test";

import {
  clearCart,
  deleteCustomer,
  deleteItem,
  deleteSalesByItemId,
  login,
  seedCustomer,
  seedItem,
  unique,
} from "./e2e-helpers";

let item: Awaited<ReturnType<typeof seedItem>>;
let customer: Awaited<ReturnType<typeof seedCustomer>>;

test.beforeAll(async () => {
  await clearCart();
  item = await seedItem({ title: unique("Article panier") });
  customer = await seedCustomer({ fullname: unique("Client panier") });
});

test.afterAll(async () => {
  await clearCart();
  await deleteSalesByItemId(item.id);
  await deleteCustomer(customer.id);
  await deleteItem(item.id);
});

test("Parcours panier complet", async ({ page }) => {
  await login(page);
  await page.goto("/cart");

  // Ajout rapide par ISBN
  await page.getByLabel("Ajout rapide").fill(item.isbn);
  await page.getByLabel("Ajout rapide").press("Enter");
  await expect(page.getByText("Panier - 1 article")).toBeVisible();

  // Retrait d'un article
  await page.getByRole("button", { name: "Enlever du panier" }).click();
  await expect(page.getByText("Aucun article dans le panier")).toBeVisible();

  // Mise de côté puis réactivation
  await page.getByLabel("Ajout rapide").fill(item.isbn);
  await page.getByLabel("Ajout rapide").press("Enter");
  await expect(page.getByText("Panier - 1 article")).toBeVisible();

  await page.getByRole("button", { name: "Mettre de côté" }).click();
  await expect(page.getByText("Panier en attente")).toBeVisible();
  await page.getByRole("button", { name: "Réactiver" }).click();
  await expect(page.getByText("Panier - 1 article")).toBeVisible();

  // Association d'un⋅e client⋅e
  await page.getByPlaceholder(/Associer/).click();
  await page.getByPlaceholder(/Associer/).fill(customer.fullname);
  await page.getByRole("option", { name: customer.fullname }).click();
  await expect(page.getByRole("link", { name: "Modifier" })).toBeVisible();

  // Paiement
  await page.getByLabel("Espèces").fill("100");
  await page.getByRole("button", { name: "Payer" }).click();
  await expect(page.getByText("Aucun article dans le panier")).toBeVisible();
  await expect(page.getByText(/À rendre/)).toBeVisible();
});
