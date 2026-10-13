import { expect, test } from "@playwright/test";

import { deleteItemsByTitleLike, login, unique } from "./e2e-helpers";

const TITLE = unique("Article créé");

test.beforeAll(async () => {
  await deleteItemsByTitleLike(`${TITLE}%`);
});

test.afterAll(async () => {
  await deleteItemsByTitleLike(`${TITLE}%`);
});

test("Ajouter un article", async ({ page }) => {
  await login(page);

  await page.goto("/add");
  await expect(page.getByRole("combobox", { name: "Type" })).toHaveValue("book");
  await expect(page.getByRole("combobox", { name: "TVA" })).toHaveValue("5.5");
  await page.getByRole("combobox", { name: "Type" }).selectOption("game");
  await expect(page.getByRole("combobox", { name: "TVA" })).toHaveValue("20");
  await page.getByRole("combobox", { name: "Type" }).selectOption("book");
  await page.getByLabel("Titre").fill(TITLE);
  await page.getByLabel("Prix de vente").fill("12.50");
  await page.getByLabel("Quantité").fill("1");
  await page.getByRole("button", { name: "Ajouter", exact: true }).click();

  await expect(page.getByText(`"${TITLE}" a été ajouté.`)).toBeVisible();

  await page.goto("/items");
  await expect(page.getByRole("link", { name: TITLE })).toBeVisible();
});
