import { expect, test } from "@playwright/test";

import { deleteUser, login, seedCashier, unique } from "./e2e-helpers";

const NAME = unique("user-mgmt");
const EDITED = `${NAME} modifié`;
const PASSWORD = "motdepasse-1";
const NEW_PASSWORD = "nouveaumdp-2";

test.beforeAll(async () => {
  await deleteUser(NAME);
  await deleteUser(EDITED);
});

test.afterAll(async () => {
  await deleteUser(NAME);
  await deleteUser(EDITED);
});

test("un administrateur gère les utilisateurs", async ({ page }) => {
  await login(page);
  await page.goto("/users");

  // Création
  await page.getByLabel("Identifiant", { exact: true }).fill(NAME);
  await page.getByLabel("Mot de passe", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Ajouter" }).click();
  await expect(page.getByText("L'utilisateur a été créé.")).toBeVisible();
  const row = page.getByRole("row").filter({ hasText: NAME });
  await expect(row).toBeVisible();

  // Modification du nom, du rôle et réinitialisation du mot de passe
  await row.getByRole("button", { name: "Éditer" }).click();
  const editRow = page
    .getByRole("row")
    .filter({ has: page.getByRole("button", { name: "Enregistrer" }) });
  await editRow.locator('input[type="text"]').fill(EDITED);
  await editRow.getByRole("combobox").selectOption("admin");
  await editRow.locator('input[type="password"]').fill(NEW_PASSWORD);
  await editRow.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByText("L'utilisateur a été modifié.")).toBeVisible();
  await expect(page.getByRole("row").filter({ hasText: EDITED })).toContainText("Administrateur");

  // Connexion avec le nouveau mot de passe
  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await expect(page).toHaveURL("/login");
  await login(page, { name: EDITED, password: NEW_PASSWORD });
  await expect(page).toHaveURL("/");

  // Suppression, depuis le compte administrateur d'origine
  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await expect(page).toHaveURL("/login");
  await login(page);
  await page.goto("/users");
  const editedRow = page.getByRole("row").filter({ hasText: EDITED });
  await editedRow.getByRole("button", { name: "Supprimer" }).click();
  await page.getByRole("button", { name: "Oui, supprimer" }).click();
  await expect(page.getByText("L'utilisateur a été supprimé.")).toBeVisible();
  await expect(page.getByRole("row").filter({ hasText: EDITED })).toHaveCount(0);
});

test("le lien Utilisateurs est réservé aux administrateurs", async ({ page }) => {
  const cashier = await seedCashier();
  try {
    await login(page, cashier);
    await expect(page.getByRole("link", { name: "Utilisateurs" })).toHaveCount(0);
    await page.goto("/users");
    await expect(page.getByText(/autorisé à accéder/)).toBeVisible();
  } finally {
    await deleteUser(cashier.name);
  }
});
