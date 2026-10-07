import { expect, test } from "@playwright/test";

import { deleteItem, login, seedItem, unique } from "./e2e-helpers";

const TITLE = unique("Article recherche");
const TITLE_2 = unique("Article recherche 2");
let item: Awaited<ReturnType<typeof seedItem>>;
let item2: Awaited<ReturnType<typeof seedItem>>;

test.beforeAll(async () => {
  item = await seedItem({ title: TITLE });
  item2 = await seedItem({ title: TITLE_2 });
});

test.afterAll(async () => {
  await deleteItem(item.id);
  await deleteItem(item2.id);
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

test("Recherche rapide par ISBN successifs met à jour l'article", async ({ page }) => {
  await login(page);

  const quickSearch = page.getByPlaceholder("ISBN, titre, auteur·ice");

  await quickSearch.fill(item.isbn);
  await quickSearch.press("Enter");
  await expect(page).toHaveURL(new RegExp(`/item/${String(item.id)}$`));
  await expect(page.getByRole("heading", { name: TITLE })).toBeVisible();

  await quickSearch.fill(item2.isbn);
  await quickSearch.press("Enter");
  await expect(page).toHaveURL(new RegExp(`/item/${String(item2.id)}$`));
  await expect(page.getByRole("heading", { name: TITLE_2 })).toBeVisible();
});

test("Recherche rapide : un ISBN trop long est tronqué à 13 chiffres", async ({ page }) => {
  await login(page);

  const quickSearch = page.getByPlaceholder("ISBN, titre, auteur·ice");
  await quickSearch.fill(`${item.isbn}999`);
  await quickSearch.press("Enter");

  await expect(page).toHaveURL(new RegExp(`/item/${String(item.id)}$`));
  await expect(page.getByRole("heading", { name: TITLE })).toBeVisible();
});
