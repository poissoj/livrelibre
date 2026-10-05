import { expect, test } from "@playwright/test";

import { ITEMS_PER_PAGE } from "@livrelibre/shared/pagination";

import {
  deleteCustomer,
  deleteItem,
  deleteItemsByTitleLike,
  login,
  seedCustomer,
  seedItem,
  seedItems,
  seedOrder,
  unique,
} from "./e2e-helpers";

let item: Awaited<ReturnType<typeof seedItem>>;
let customer: Awaited<ReturnType<typeof seedCustomer>>;

test.beforeAll(async () => {
  item = await seedItem({ title: unique("Article a11y") });
  customer = await seedCustomer({ fullname: unique("Client a11y") });
});

test.afterAll(async () => {
  await deleteCustomer(customer.id);
  await deleteItem(item.id);
});

test("les moyens de contact sont sélectionnables au clavier", async ({
  page,
}) => {
  await login(page);
  await page.goto("/order/new");

  const unknown = page.getByRole("radio", { name: "Non renseigné" });
  await expect(unknown).toBeVisible();
  await expect(unknown).toBeChecked();

  await unknown.focus();
  await expect(unknown).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("radio", { name: "Passera" })).toBeChecked();

  await expect(page.getByRole("radio", { name: "Téléphone" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "Mail" })).toBeVisible();
});

test("les groupes de champs ont un nom accessible", async ({ page }) => {
  await login(page);
  await page.goto("/order/new");

  await expect(
    page.getByRole("group", { name: "Contacter par" }),
  ).toBeVisible();
  await expect(page.getByRole("group", { name: "Client⋅e" })).toBeVisible();
});

test("le statut de commande a un nom accessible", async ({ page }) => {
  await seedOrder({
    customerId: customer.id,
    itemId: item.id,
    itemTitle: unique("Article a11y statut"),
    ordered: "new",
  });

  await login(page);
  await page.goto("/orders");

  await expect(
    page.getByRole("img", { name: "En cours" }).first(),
  ).toBeVisible();
});

test("une erreur de chargement est annoncée (role=alert)", async ({ page }) => {
  await login(page);
  await page.route("**/api/trpc/*", (route) =>
    route.fulfill({ status: 500, body: "Internal Server Error" }),
  );

  await page.goto("/items");

  await expect(page.getByRole("main").getByRole("alert")).toBeVisible();
});

test("un chargement est annoncé (role=status)", async ({ page }) => {
  await login(page);
  await page.route("**/api/trpc/*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await route.continue();
  });

  await page.goto("/items");

  await expect(
    page.getByRole("main").getByRole("status").first(),
  ).toBeVisible();
});

test("le champ de recherche de l'en-tête a un nom accessible", async ({
  page,
}) => {
  await login(page);

  await expect(
    page.getByRole("searchbox", { name: "Rechercher un article" }),
  ).toBeVisible();
});

test("la pagination expose un landmark et la page courante", async ({
  page,
}) => {
  const titleBase = unique("Article pagination");
  await seedItems(ITEMS_PER_PAGE + 1, { title: titleBase });
  try {
    await login(page);
    await page.goto("/items");

    await expect(page.locator('nav[aria-label^="Pagination"]')).toBeVisible();

    await page.getByRole("link", { name: "Page 2" }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(
      page.locator('nav[aria-label^="Pagination"] [aria-current="page"]'),
    ).toHaveText("2");
  } finally {
    await deleteItemsByTitleLike(`${titleBase}%`);
  }
});
