import { expect, test } from "@playwright/test";

import { login } from "./e2e-helpers";

test("une panne du endpoint user ne déconnecte pas (fail-open)", async ({ page }) => {
  await login(page);

  // Force the guard's user query to fail: a transient error must not redirect
  // to /login. The session cookie stays valid, so the target page still loads.
  await page.route(/\/api\/trpc\/user(?:\?|$)/, (route) =>
    route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: { message: "boom" } }),
    }),
  );

  await page.goto("/items");

  await expect(page).toHaveURL("/items");
  await expect(page.getByRole("main")).toBeVisible();
});
