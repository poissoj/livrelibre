import { expect, test } from "@playwright/test";

import { deleteItem, login, seedItem, unique } from "./e2e-helpers";

test("le titre du document reflète la route et les données chargées", async ({ page }) => {
  const item = await seedItem({ title: unique("Titre article") });

  try {
    await login(page);
    await expect(page).toHaveTitle("Tableau de bord | Livre Libre");

    // Titre statique porté par `meta.title`.
    await page.goto("/settings");
    await expect(page).toHaveTitle("Réglages | Livre Libre");

    await page.goto("/order/new");
    await expect(page).toHaveTitle("Nouvelle commande | Livre Libre");

    // Titre dynamique (nom de l'article), sans double séparateur.
    await page.goto(`/item/${String(item.id)}`);
    await expect(page).toHaveTitle(`${item.title} | Livre Libre`);

    // Titre dynamique (terme de recherche).
    await page.goto("/quicksearch?search=abc");
    await expect(page).toHaveTitle('Recherche de "abc" | Livre Libre');
  } finally {
    await deleteItem(item.id);
  }
});
