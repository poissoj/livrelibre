import { expect, test } from "@playwright/test";

import { deleteUser, login, seedUser, unique } from "./e2e-helpers";

const NAME = unique("user-password");
const OLD_PASSWORD = "ancien-mot-de-passe";
const NEW_PASSWORD = "nouveau-mot-de-passe";

test.beforeAll(async () => {
  await deleteUser(NAME);
  await seedUser({ name: NAME, password: OLD_PASSWORD, role: "cashier" });
});

test.afterAll(async () => {
  await deleteUser(NAME);
});

test("change le mot de passe puis se reconnecte avec le nouveau", async ({ page }) => {
  await login(page, { name: NAME, password: OLD_PASSWORD });

  await page.getByRole("link", { name: "Changer mon mot de passe" }).click();
  await expect(page).toHaveURL("/account/password");

  await page.getByLabel("Mot de passe actuel", { exact: true }).fill(OLD_PASSWORD);
  await page.getByLabel("Nouveau mot de passe", { exact: true }).fill(NEW_PASSWORD);
  await page.getByLabel("Confirmer le nouveau mot de passe", { exact: true }).fill(NEW_PASSWORD);
  await page.getByRole("button", { name: "Modifier" }).click();
  await expect(page.getByText("Le mot de passe a été modifié.")).toBeVisible();

  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await expect(page).toHaveURL("/login");

  await login(page, { name: NAME, password: NEW_PASSWORD });
  await expect(page).toHaveURL("/");
});
