import { expect, test } from "@playwright/test";

import {
  clearCart,
  deleteItem,
  deletePaymentMethodByCode,
  login,
  seedItem,
  unique,
} from "./e2e-helpers";

const LABEL = unique("Paiement test");
const CODE = LABEL.normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");
const EDITED_LABEL = `${LABEL} modifié`;

let item: Awaited<ReturnType<typeof seedItem>>;

test.beforeAll(async () => {
  await clearCart();
  item = await seedItem({ title: unique("Article moyen de paiement") });
});

test.afterAll(async () => {
  await clearCart();
  await deletePaymentMethodByCode(CODE);
  await deleteItem(item.id);
});

test("un administrateur gère les moyens de paiement", async ({ page }) => {
  await login(page);
  await page.goto("/settings");
  const card = page.getByRole("region", { name: "Moyens de paiement" });

  await card.getByRole("button", { name: "Ajouter" }).click();
  await expect(card.locator('tbody input[type="text"]')).toBeFocused();
  const newRow = card.locator("tbody tr").last();
  await newRow.locator('input[type="text"]').fill(LABEL);
  await newRow.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText("Moyen de paiement créé.")).toBeVisible();

  const row = card.getByRole("row").filter({ hasText: LABEL });
  await expect(row).toHaveCount(1);

  const editRow = card.locator("tbody tr").last();
  await editRow.getByRole("button", { name: "Éditer" }).click();
  await editRow.locator('input[type="text"]').fill(EDITED_LABEL);
  await editRow.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText("Moyen de paiement modifié.")).toBeVisible();

  await page.goto("/cart");
  await page.getByLabel("Ajout rapide").fill(item.isbn);
  await page.getByLabel("Ajout rapide").press("Enter");
  await expect(page.getByText("Panier - 1 article")).toBeVisible();
  await expect(
    page.getByLabel("Moyen de paiement").getByRole("option", { name: EDITED_LABEL }),
  ).toHaveCount(1);

  await page.goto("/settings");
  const editedRow = card.getByRole("row").filter({ hasText: EDITED_LABEL });
  await editedRow.getByRole("button", { name: "Supprimer" }).click();
  await page.getByRole("button", { name: "Oui, supprimer" }).click();
  await expect(page.getByText("Moyen de paiement supprimé.")).toBeVisible();
  await expect(card.getByRole("row").filter({ hasText: EDITED_LABEL })).toHaveCount(0);

  await page.goto("/cart");
  await expect(
    page.getByLabel("Moyen de paiement").getByRole("option", { name: EDITED_LABEL }),
  ).toHaveCount(0);
});
