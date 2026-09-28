import { expect, test } from "@playwright/test";

import { deleteItem, login, seedItem, unique } from "./e2e-helpers";

const TITLE = unique("Article recherche");
let item: Awaited<ReturnType<typeof seedItem>>;

test.beforeAll(async () => {
  item = await seedItem({ title: TITLE });
});

test.afterAll(async () => {
  await deleteItem(item.id);
});

test("Recherche avancée", async ({ page }) => {
  await login(page);

  await page.goto("/search");
  await page.getByLabel("Titre").fill(TITLE);
  await page.getByLabel("Titre").press("Enter");

  await expect(page).toHaveURL(/\/advancedSearch/);
  await expect(page.getByText(/résultat/).first()).toBeVisible();
  await expect(page.getByRole("link", { name: TITLE })).toBeVisible();

  await page.getByLabel("En stock").check();
  await expect(page.getByRole("link", { name: TITLE })).toBeVisible();
});

test("Recherche rapide depuis l'en-tête", async ({ page }) => {
  await login(page);

  const quickSearch = page.getByPlaceholder("ISBN, titre, auteur·ice");
  await quickSearch.fill(TITLE);
  await quickSearch.press("Enter");

  await expect(page).toHaveURL(/\/quicksearch\?search=/);
  await expect(page.getByRole("link", { name: TITLE })).toBeVisible();
});
