import { expect, test } from "@playwright/test";

import {
  clearCart,
  deleteCustomer,
  deleteItem,
  login,
  seedCustomer,
  seedItem,
  seedOrder,
  unique,
} from "./e2e-helpers";

let item: Awaited<ReturnType<typeof seedItem>>;
let customer: Awaited<ReturnType<typeof seedCustomer>>;
let order: Awaited<ReturnType<typeof seedOrder>>;
let orderTitle: string;

test.beforeAll(async () => {
  await clearCart();
  item = await seedItem({ title: unique("Article retour") });
  customer = await seedCustomer({ fullname: unique("Client retour") });
  orderTitle = unique("Commande retour");
  order = await seedOrder({ customerId: customer.id, itemId: item.id, itemTitle: orderTitle });
});

test.afterAll(async () => {
  await clearCart();
  await deleteCustomer(customer.id);
  await deleteItem(item.id);
});

test("le retour d'une commande revient à la fiche client", async ({ page }) => {
  await login(page);
  await page.goto(`/customer/${String(customer.id)}`);

  await page.getByRole("link").filter({ hasText: orderTitle }).click();
  await expect(page).toHaveURL(new RegExp(`/order/${String(order.id)}$`));

  const back = page.getByRole("link", { name: "Retour", exact: true });
  await expect(back).toHaveAttribute("href", `/customer/${String(customer.id)}`);
  await back.click();
  await expect(page).toHaveURL(new RegExp(`/customer/${String(customer.id)}$`));
});

test("le retour de la fiche client revient au panier", async ({ page }) => {
  await login(page);
  await page.goto("/cart");
  await page.getByLabel("Ajout rapide").fill(item.isbn);
  await page.getByLabel("Ajout rapide").press("Enter");
  await expect(page.getByText("Panier - 1 article")).toBeVisible();

  await page.getByPlaceholder(/Associer/).click();
  await page.getByPlaceholder(/Associer/).fill(customer.fullname);
  await page.getByRole("option", { name: customer.fullname }).click();

  await page.getByRole("link", { name: "Modifier" }).click();
  await expect(page).toHaveURL(new RegExp(`/customer/${String(customer.id)}$`));

  const back = page.getByRole("link", { name: "Retour", exact: true });
  await expect(back).toHaveAttribute("href", "/cart");
  await back.click();
  await expect(page).toHaveURL("/cart");
});

test("sans historique, le retour utilise la page de repli", async ({ page }) => {
  await login(page);
  await page.goto(`/order/${String(order.id)}`);

  const back = page.getByRole("link", { name: "Retour", exact: true });
  await expect(back).toHaveAttribute("href", "/orders");
  await back.click();
  await expect(page).toHaveURL("/orders");
});
