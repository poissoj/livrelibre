import { expect, test } from "@playwright/test";

import {
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

const makeOrder = async (suffix: string) => {
  const itemTitle = `${item.title} ${suffix}`;
  const order = await seedOrder({
    customerId: customer.id,
    itemId: item.id,
    itemTitle,
  });
  return { order, itemTitle };
};

test.beforeAll(async () => {
  item = await seedItem({ title: unique("Article commande") });
  customer = await seedCustomer({ fullname: unique("Client commande") });
});

test.afterAll(async () => {
  await deleteCustomer(customer.id);
  await deleteItem(item.id);
});

test("Marquer une commande comme prévenue", async ({ page }) => {
  const { itemTitle } = await makeOrder("prévenu");
  await login(page);
  await page.goto("/orders");

  const row = page.getByRole("row").filter({ hasText: itemTitle });
  await expect(row).toBeVisible();

  await row.getByRole("checkbox").first().click();
  await expect(page.getByText(/marquée comme prévenue/)).toBeVisible();
});

test("Grouper, ouvrir et modifier une commande", async ({ page }) => {
  const { order, itemTitle } = await makeOrder("grouper");
  await login(page);
  await page.goto("/orders");

  const groupToggle = page.getByLabel("Grouper les commandes par client⋅e");
  await expect(groupToggle).toBeChecked();
  await groupToggle.click();
  await expect(
    page.getByRole("row").filter({ hasText: itemTitle }),
  ).toBeVisible();

  await page.getByRole("row").filter({ hasText: itemTitle }).click();
  await expect(page).toHaveURL(new RegExp(`/order/${String(order.id)}`));

  await page.getByLabel("État").selectOption({ label: "Reçu" });
  await page.getByRole("button", { name: "Modifier", exact: true }).click();
  await expect(page.getByText("La commande a été modifiée")).toBeVisible();
});

test("Supprimer une commande", async ({ page }) => {
  const { order } = await makeOrder("supprimer");
  await login(page);
  await page.goto(`/order/${String(order.id)}`);

  await page.getByRole("button", { name: "Supprimer", exact: true }).click();
  await page.getByRole("button", { name: "Oui, supprimer" }).click();
  await expect(page).toHaveURL("/orders");
});
