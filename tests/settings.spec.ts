import { expect, test } from "@playwright/test";

import { deleteItemTypeByCode, deleteUser, login, seedCashier, unique } from "./e2e-helpers";

const LABEL = unique("Type test");
const CODE = LABEL.normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");
const EDITED_LABEL = `${LABEL} modifié`;

test.afterAll(async () => {
  await deleteItemTypeByCode(CODE);
});

test("un administrateur gère les types d'article", async ({ page }) => {
  await login(page);
  await page.goto("/settings");

  await page.getByRole("button", { name: "Ajouter" }).click();
  await expect(page.locator('tbody input[type="text"]')).toBeFocused();
  const newRow = page.locator("tbody tr").last();
  await newRow.locator('input[type="text"]').fill(LABEL);
  await newRow.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText("Type d'article créé.")).toBeVisible();

  const row = page.getByRole("row").filter({ hasText: CODE });
  await expect(row).toBeVisible();

  await row.getByRole("button", { name: "Monter" }).click();
  await expect(page.locator("tbody tr").last()).not.toContainText(CODE);

  await row.getByRole("button", { name: "Éditer" }).click();
  await row.locator('input[type="text"]').fill(EDITED_LABEL);
  await row.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText("Type d'article modifié.")).toBeVisible();
  await expect(page.getByRole("row").filter({ hasText: CODE })).toContainText(EDITED_LABEL);

  await page
    .getByRole("row")
    .filter({ hasText: CODE })
    .getByRole("button", { name: "Supprimer" })
    .click();
  await page.getByRole("button", { name: "Oui, supprimer" }).click();
  await expect(page.getByText("Type d'article supprimé.")).toBeVisible();
  await expect(page.getByRole("row").filter({ hasText: CODE })).toHaveCount(0);
});

test("le défaut est refusé pour un type inactif", async ({ page }) => {
  await login(page);
  await page.goto("/settings");

  const row = page.getByRole("row").filter({ hasText: "discount" });
  await row.getByRole("button", { name: "Éditer" }).click();
  await expect(row.getByRole("checkbox", { name: "Type par défaut" })).toBeDisabled();
});

test("Réglages est réservé aux administrateurs", async ({ page }) => {
  const cashier = await seedCashier();
  try {
    await login(page, cashier);
    await expect(page.getByRole("link", { name: "Réglages" })).toHaveCount(0);
    await page.goto("/settings");
    await expect(page.getByText(/autorisé à accéder/)).toBeVisible();
  } finally {
    await deleteUser(cashier.name);
  }
});
