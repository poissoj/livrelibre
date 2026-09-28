import { expect, test } from "@playwright/test";

import {
  deleteCustomersByFullnameLike,
  login,
  seedCustomer,
  seedOrder,
  unique,
} from "./e2e-helpers";

const NAME_PREFIX = unique("Client CRUD");
const NAME = NAME_PREFIX;
const EDITED = `${NAME_PREFIX} modifié`;
const BLOCKED_PREFIX = unique("Client commandes");

test.beforeAll(async () => {
  await deleteCustomersByFullnameLike(`${NAME_PREFIX}%`);
  await deleteCustomersByFullnameLike(`${BLOCKED_PREFIX}%`);
});

test.afterAll(async () => {
  await deleteCustomersByFullnameLike(`${NAME_PREFIX}%`);
  await deleteCustomersByFullnameLike(`${BLOCKED_PREFIX}%`);
});

test("Créer, modifier puis supprimer un⋅e client⋅e", async ({ page }) => {
  await login(page);

  await page.goto("/customer/new");
  await page.getByLabel("Nom complet").fill(NAME);
  await page.getByRole("button", { name: "Ajouter", exact: true }).click();
  await expect(page.getByText("Le client a été ajouté")).toBeVisible();

  await page.goto("/customers");
  await page.getByRole("row").filter({ hasText: NAME }).click();
  await expect(page).toHaveURL(/\/customer\/\d+/);

  await page.getByLabel("Nom complet").fill(EDITED);
  await page.getByRole("button", { name: "Modifier", exact: true }).click();
  await expect(page.getByText("Le client a été modifié")).toBeVisible();

  await page.getByRole("button", { name: "Supprimer", exact: true }).click();
  await page.getByRole("button", { name: "Oui, supprimer" }).click();
  await expect(page).toHaveURL("/customers");
});

test("Suppression bloquée si le client a des commandes", async ({ page }) => {
  const customer = await seedCustomer({ fullname: BLOCKED_PREFIX });
  await seedOrder({ customerId: customer.id, itemTitle: "Article E2E" });

  await login(page);
  await page.goto(`/customer/${String(customer.id)}`);
  await page.getByRole("button", { name: "Supprimer", exact: true }).click();
  await page.getByRole("button", { name: "Oui, supprimer" }).click();

  await expect(
    page.getByText("Ce client a des commandes et ne peut pas être supprimé"),
  ).toBeVisible();
});
