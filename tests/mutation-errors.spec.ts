import { expect, test } from "@playwright/test";

import {
  clearCart,
  deleteItem,
  deleteUser,
  login,
  seedItem,
  seedUser,
  unique,
} from "./e2e-helpers";

const USER_NAME = unique("user-error");
const USER_PASSWORD = "motdepasse-1";

test.beforeAll(async () => {
  await deleteUser(USER_NAME);
  await seedUser({ name: USER_NAME, password: USER_PASSWORD });
});

test.afterAll(async () => {
  await deleteUser(USER_NAME);
});

test("une mutation échouée affiche un seul toast global", async ({ page }) => {
  await login(page);
  await page.goto("/users");

  await page.getByRole("button", { name: "Ajouter" }).click();
  const newRow = page.locator("tbody tr").last();
  await newRow.locator('input[type="text"]').fill(USER_NAME);
  await newRow.locator('input[type="password"]').fill("motdepasse-2");
  await newRow.getByRole("button", { name: "Enregistrer" }).click();

  await expect(
    page.locator("[data-sonner-toast]", {
      hasText: "Un utilisateur avec cet identifiant existe déjà.",
    }),
  ).toHaveCount(1);
});

test("une erreur affichée inline ne produit pas de toast", async ({ page }) => {
  await login(page);
  await page.goto("/account/password");

  const message = "Mot de passe actuel incorrect.";
  await page.getByLabel("Mot de passe actuel", { exact: true }).fill("mauvais-mot-de-passe");
  await page.getByLabel("Nouveau mot de passe", { exact: true }).fill("nouveau-mot-de-passe");
  await page
    .getByLabel("Confirmer le nouveau mot de passe", { exact: true })
    .fill("nouveau-mot-de-passe");
  await page.getByRole("button", { name: "Modifier" }).click();

  await expect(
    page.getByRole("main").getByRole("alert").filter({ hasText: message }),
  ).toBeVisible();
  await expect(page.locator("[data-sonner-toast]", { hasText: message })).toHaveCount(0);
});

test("l'ajout rapide d'un ISBN inconnu affiche une erreur inline", async ({ page }) => {
  const isbn = "9999999999999";
  await clearCart();
  try {
    await login(page);
    await page.goto("/cart");

    await page.getByLabel("Ajout rapide").fill(isbn);
    await page.getByLabel("Ajout rapide").press("Enter");

    const message = `Aucun article trouvé pour ${isbn}`;
    await expect(
      page.getByRole("main").getByRole("alert").filter({ hasText: message }),
    ).toBeVisible();
    await expect(page.locator("[data-sonner-toast]", { hasText: message })).toHaveCount(0);
  } finally {
    await clearCart();
  }
});

test("l'ajout rapide d'un article sans stock affiche une erreur inline", async ({ page }) => {
  const item = await seedItem({ title: unique("Article sans stock"), amount: 0 });
  await clearCart();
  try {
    await login(page);
    await page.goto("/cart");

    await page.getByLabel("Ajout rapide").fill(item.isbn);
    await page.getByLabel("Ajout rapide").press("Enter");

    const message = `Pas de stock pour ${item.title}`;
    await expect(
      page.getByRole("main").getByRole("alert").filter({ hasText: message }),
    ).toBeVisible();
    await expect(page.locator("[data-sonner-toast]", { hasText: "Pas de stock" })).toHaveCount(0);
  } finally {
    await clearCart();
    await deleteItem(item.id);
  }
});

test("un échec d'ajout au panier affiche un toast global", async ({ page }) => {
  const item = await seedItem({ title: unique("Article panier erreur") });
  try {
    await login(page);
    await page.route(/\/api\/trpc\/addToCart(?:\?|$)/, (route) =>
      route.fulfill({ status: 500, body: "Internal Server Error" }),
    );
    await page.goto(`/item/${String(item.id)}`);

    await page.getByRole("button", { name: "Ajouter au panier" }).click();

    await expect(page.locator("[data-sonner-toast]")).toHaveCount(1);
  } finally {
    await deleteItem(item.id);
  }
});
