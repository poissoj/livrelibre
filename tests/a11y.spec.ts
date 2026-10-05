import { expect, test } from "@playwright/test";

import { login } from "./e2e-helpers";

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
