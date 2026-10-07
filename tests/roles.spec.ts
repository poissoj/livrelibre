import { expect, test } from "@playwright/test";

import { deleteUser, login, seedCashier } from "./e2e-helpers";

let cashier: Awaited<ReturnType<typeof seedCashier>>;

test.beforeAll(async () => {
  cashier = await seedCashier();
});

test.afterAll(async () => {
  await deleteUser(cashier.name);
});

test("Rôle caissier : accès restreint aux ventes", async ({ page }) => {
  await login(page, cashier);

  await expect(page.getByRole("link", { name: "Ventes", exact: true })).toHaveAttribute(
    "href",
    "/todaySales",
  );

  await page.goto("/sales");
  await expect(page.getByText(/autorisé à accéder/)).toBeVisible();

  await page.goto("/sale/2024/01");
  await expect(page.getByText(/autorisé à accéder/)).toBeVisible();

  await page.goto("/todaySales");
  await expect(page.getByRole("heading", { name: "Répartition par TVA" })).toBeVisible();
});
