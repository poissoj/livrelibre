import { expect, test } from "@playwright/test";

import { deleteCustomer, deleteItem, login, seedCustomer, seedItem, unique } from "./e2e-helpers";

test("affiche le message d'erreur de validation côté client", async ({ page }) => {
  await login(page);

  await page.goto("/add");
  await page.getByLabel("Titre").fill("Test validation");
  await page.getByLabel("Prix de vente").fill("10.00");
  await page.getByRole("textbox", { name: "ISBN" }).fill("abc");
  await page.getByRole("button", { name: "Ajouter", exact: true }).click();

  await expect(page.getByText("ISBN invalide")).toBeVisible();
});

test("bloque la soumission quand le prix requis est vide", async ({ page }) => {
  await login(page);

  await page.goto("/add");
  await page.getByLabel("Titre").fill("Test prix");
  await page.getByRole("button", { name: "Ajouter", exact: true }).click();

  await expect(page).toHaveURL("/add");
  const validity = await page
    .getByLabel("Prix de vente")
    .evaluate((element) => (element as HTMLInputElement).validity.valueMissing);
  expect(validity).toBe(true);
});

test("bloque la soumission quand le nouveau mot de passe est trop court", async ({ page }) => {
  await login(page);
  await page.goto("/account/password");

  await page.getByLabel("Mot de passe actuel", { exact: true }).fill("peu-importe");
  await page.getByLabel("Nouveau mot de passe", { exact: true }).fill("court");
  await page.getByLabel("Confirmer le nouveau mot de passe", { exact: true }).fill("court");
  await page.getByRole("button", { name: "Modifier" }).click();

  await expect(page).toHaveURL("/account/password");
  const tooShort = await page
    .getByLabel("Nouveau mot de passe", { exact: true })
    .evaluate((element) => (element as HTMLInputElement).validity.tooShort);
  expect(tooShort).toBe(true);
});

test("bloque une commande sans client avec un message dédié", async ({ page }) => {
  await login(page);
  await page.goto("/order/new");

  await page.getByRole("button", { name: "Ajouter", exact: true }).click();

  await expect(page).toHaveURL("/order/new");
  const state = await page.getByRole("combobox", { name: /Rechercher un/ }).evaluate((element) => {
    const input = element as HTMLInputElement;
    return { valid: input.validity.valid, message: input.validationMessage };
  });
  expect(state.valid).toBe(false);
  expect(state.message).toBe("Merci de sélectionner un⋅e client⋅e");
});

test("affiche l'erreur zod de confirmation du mot de passe", async ({ page }) => {
  await login(page);
  await page.goto("/account/password");

  await page.getByLabel("Mot de passe actuel", { exact: true }).fill("peu-importe");
  await page.getByLabel("Nouveau mot de passe", { exact: true }).fill("nouveau-mot-de-passe");
  await page
    .getByLabel("Confirmer le nouveau mot de passe", { exact: true })
    .fill("autre-mot-de-passe");
  await page.getByRole("button", { name: "Modifier" }).click();

  await expect(page.getByText("Les deux mots de passe ne correspondent pas.")).toBeVisible();
});

test("changer l'ISBN détache l'article précédemment sélectionné", async ({ page }) => {
  const customer = await seedCustomer({ fullname: unique("Client desync") });
  const itemA = await seedItem({ title: unique("Article desync A") });
  const itemB = await seedItem({ title: unique("Article desync B") });

  try {
    await login(page);

    // Pre-select item A through the query string (avoids the search combobox).
    await page.goto(`/order/new?item=${String(itemA.id)}`);

    const isbnInput = page.getByRole("textbox", { name: "ISBN" });
    await expect(isbnInput).toHaveValue(itemA.isbn);

    // Editing the ISBN must detach item A: submitting resolves B instead of
    // silently keeping A's id/title with B's ISBN.
    await isbnInput.fill(itemB.isbn);
    await expect(isbnInput).toHaveValue(itemB.isbn);

    await page.getByRole("combobox", { name: /Rechercher un/ }).fill(customer.fullname);
    await page.getByRole("option", { name: customer.fullname }).click();

    const lookup = page.waitForResponse((response) =>
      response.url().includes("/api/trpc/isbnSearch"),
    );
    await page.getByRole("button", { name: "Ajouter", exact: true }).click();
    await lookup;

    await expect(page.getByRole("combobox", { name: "Titre" })).toHaveValue(itemB.title);
  } finally {
    await deleteCustomer(customer.id);
    await deleteItem(itemA.id);
    await deleteItem(itemB.id);
  }
});
