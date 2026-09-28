import { expect, test } from "@playwright/test";

import { clearCart, login, unique } from "./e2e-helpers";

test.beforeAll(clearCart);
test.afterAll(clearCart);

test("Tableau de bord : vendre un article non répertorié", async ({ page }) => {
  await login(page);

  await expect(page.getByText("Favoris")).toBeVisible();
  await expect(
    page.getByText("Vendre un article non répertorié"),
  ).toBeVisible();

  await page.getByLabel("Prix").fill("5");
  await page.getByLabel("Titre").fill(unique("Article libre"));
  await page.getByLabel("Titre").press("Enter");

  await expect(page.getByText("Article ajouté au panier")).toBeVisible();
});

test("Déconnexion", async ({ page }) => {
  await login(page);

  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await expect(page).toHaveURL("/login");
});
