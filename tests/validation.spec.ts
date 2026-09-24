import { expect, test } from "@playwright/test";

import { E2E_USER } from "./e2e-user";

test("affiche le message d'erreur de validation du serveur", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Identifiant").fill(E2E_USER.name);
  await page.getByLabel("Mot de passe").fill(E2E_USER.password);
  await page.getByRole("button", { name: "Connexion" }).click();
  await expect(page).toHaveURL("/");

  await page.goto("/add");
  await page.getByLabel("Titre").fill("Test validation");
  await page.getByLabel("Prix de vente").fill("10.00");
  await page.locator('input[name="isbn"]').fill("abc");
  await page.getByRole("button", { name: "Ajouter" }).click();

  await expect(page.getByText("ISBN invalide")).toBeVisible();
});
