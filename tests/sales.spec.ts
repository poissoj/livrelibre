import { expect, test } from "@playwright/test";

import { deleteSalesByTitleLike, login, seedSale, unique } from "./e2e-helpers";

const TITLE = unique("Vente E2E");

test.beforeAll(async () => {
  await deleteSalesByTitleLike(`${TITLE}%`);
});

test.afterAll(async () => {
  await deleteSalesByTitleLike(`${TITLE}%`);
});

test("Ventes, ventes du jour, statistiques et meilleures ventes", async ({
  page,
}) => {
  await seedSale({ title: TITLE });
  await login(page);

  await page.goto("/sales");
  await expect(page.getByText("Liste des ventes par mois")).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Nombre de ventes", exact: true }),
  ).toBeVisible();
  await page.getByRole("row").nth(1).click();
  await expect(page).toHaveURL(/\/sale\/\d{4}\/\d{2}$/);
  await expect(
    page.getByRole("heading", { name: "Répartition par TVA" }),
  ).toBeVisible();

  await page.goto("/todaySales");
  await expect(
    page.getByText("Répartition par type de paiement"),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Panier", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Supprimer la vente" }).first(),
  ).toBeVisible();

  await page.goto("/stats");
  await expect(page.getByText("Nombre de ventes par heure")).toBeVisible();
  await expect(page.getByText("Nombre de ventes par jour")).toBeVisible();

  await page.goto("/best-sales");
  await expect(
    page.getByRole("heading", { name: "Meilleures ventes" }),
  ).toBeVisible();
});
