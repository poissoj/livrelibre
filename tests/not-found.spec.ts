import { expect, test } from "@playwright/test";

import { E2E_USER } from "./e2e-user";

test("Affiche « introuvable » pour des entités inexistantes", async ({ page }) => {
  await page.goto(`/login`);
  await page.getByLabel("Identifiant").fill(E2E_USER.name);
  await page.getByLabel("Mot de passe").fill(E2E_USER.password);
  await page.getByRole("button", { name: "Connexion" }).click();
  await expect(page).toHaveURL("/");

  await page.goto(`/customer/99999999`);
  await expect(page.getByText("Client introuvable")).toBeVisible();

  await page.goto(`/update/99999999`);
  await expect(page.getByText("Article introuvable")).toBeVisible();

  await page.goto(`/order/99999999`);
  await expect(page.getByText("Commande introuvable")).toBeVisible();
});
