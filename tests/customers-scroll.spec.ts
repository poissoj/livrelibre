import { expect, test } from "@playwright/test";

import { deleteCustomersByFullnameLike, login, seedCustomers, unique } from "./e2e-helpers";

// More than ITEMS_PER_PAGE (50) customers so the list has at least two pages.
const NAME_PREFIX = unique("Client scroll");
const CUSTOMERS_COUNT = 51;

test.beforeAll(async () => {
  await deleteCustomersByFullnameLike(`${NAME_PREFIX}%`);
  await seedCustomers(CUSTOMERS_COUNT, { fullname: NAME_PREFIX });
});

test.afterAll(async () => {
  await deleteCustomersByFullnameLike(`${NAME_PREFIX}%`);
});

test("remonte en haut de la liste des client⋅es au changement de page", async ({ page }) => {
  await login(page);
  await page.goto("/customers");

  await expect(page.getByRole("link", { name: "Page 2" })).toBeVisible();

  // AppMain wraps the page in a layout-level `.overflow-auto` that does not scroll:
  // target the closest scrollable ancestor of the list instead.
  const scroller = page
    .getByRole("table", { name: "Liste des client⋅es" })
    .locator("xpath=ancestor::div[contains(@class,'overflow-auto')][1]");
  await expect(scroller).toBeVisible();

  const expectedTop = await scroller.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
    return el.scrollTop;
  });
  expect(expectedTop).toBeGreaterThan(0);

  await page.getByRole("link", { name: "Page 2" }).click();
  await expect(page).toHaveURL(/page=2/);

  await expect.poll(() => scroller.evaluate((el) => el.scrollTop)).toBe(0);
});
