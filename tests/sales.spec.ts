import { expect, test } from "@playwright/test";

import { deleteSalesByTitleLike, login, seedSale, unique } from "./e2e-helpers";

const TITLE = unique("Vente E2E");
const DELETE_TITLE = unique("Vente suppression E2E");
const SEARCH_TITLE = unique("Vente recherche E2E");
const SEARCH_DELETED_TITLE = unique("Vente recherche supprimée E2E");

test.beforeAll(async () => {
  await deleteSalesByTitleLike(`${TITLE}%`);
  await deleteSalesByTitleLike(`${DELETE_TITLE}%`);
  await deleteSalesByTitleLike(`${SEARCH_TITLE}%`);
  await deleteSalesByTitleLike(`${SEARCH_DELETED_TITLE}%`);
});

test.afterAll(async () => {
  await deleteSalesByTitleLike(`${TITLE}%`);
  await deleteSalesByTitleLike(`${DELETE_TITLE}%`);
  await deleteSalesByTitleLike(`${SEARCH_TITLE}%`);
  await deleteSalesByTitleLike(`${SEARCH_DELETED_TITLE}%`);
});

test("Ventes, ventes du jour, statistiques et meilleures ventes", async ({ page }) => {
  await seedSale({ title: TITLE });
  await login(page);

  await page.goto("/sales");
  await expect(page.getByText("Liste des ventes par mois")).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Nombre de ventes", exact: true }),
  ).toBeVisible();
  await page.getByRole("row").nth(1).click();
  await expect(page).toHaveURL(/\/sale\/\d{4}\/\d{2}$/);
  await expect(page.getByRole("heading", { name: "Répartition par TVA" })).toBeVisible();

  await page.goto("/todaySales");
  await expect(page.getByText("Répartition par type de paiement")).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Panier", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Supprimer la vente" }).first()).toBeVisible();

  await page.goto("/stats");
  await expect(page.getByText("Nombre de ventes par heure")).toBeVisible();
  await expect(page.getByText("Nombre de ventes par jour")).toBeVisible();

  await page.goto("/best-sales");
  await expect(page.getByRole("heading", { name: "Meilleures ventes" })).toBeVisible();
  await expect(page.getByLabel("Du")).toBeVisible();
  await expect(page.getByLabel("Au")).toBeVisible();
});

test("Supprimer une vente", async ({ page }) => {
  await seedSale({ title: DELETE_TITLE });
  await login(page);

  await page.goto("/todaySales");

  const row = page.getByRole("row").filter({ hasText: DELETE_TITLE });
  await expect(row).toBeVisible();

  const deleteButton = row.getByRole("button", { name: "Supprimer la vente" });
  await deleteButton.click();

  // La confirmation s'affiche avant toute suppression.
  await expect(page.getByRole("heading", { name: "Supprimer la vente" })).toBeVisible();
  await page.getByRole("button", { name: "Oui, supprimer" }).click();

  // La vente est supprimée (suppression logique) : son bouton disparaît.
  await expect(deleteButton).not.toBeVisible();
});

test("Rechercher une vente", async ({ page }) => {
  await seedSale({ title: SEARCH_TITLE, paymentType: "card" });
  await login(page);

  await page.goto("/sales/search");
  await page.getByLabel("Titre").fill(SEARCH_TITLE);
  await page.getByRole("button", { name: "Rechercher une vente" }).click();

  await expect(page).toHaveURL(/\/sales\/search\?/);
  await expect(page.getByText(SEARCH_TITLE)).toBeVisible();
});

test("Rechercher une vente supprimée", async ({ page }) => {
  await seedSale({ title: SEARCH_DELETED_TITLE, deleted: true });
  await login(page);

  await page.goto("/sales/search");
  await page.getByLabel("Titre").fill(SEARCH_DELETED_TITLE);
  await page.getByRole("button", { name: "Rechercher une vente" }).click();
  await expect(page.getByText("Aucun résultat.")).toBeVisible();

  await page.getByLabel("Inclure les ventes supprimées").check();
  await page.getByRole("button", { name: "Rechercher une vente" }).click();
  await expect(page.getByText(SEARCH_DELETED_TITLE)).toBeVisible();
});
