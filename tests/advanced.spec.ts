import { expect, test } from "@playwright/test";

import { deleteItem, login, seedItem, unique, uniqueIsbn } from "./e2e-helpers";

const TITLE = unique("Article import");
let item: Awaited<ReturnType<typeof seedItem>>;

test.beforeAll(async () => {
  item = await seedItem({ isbn: uniqueIsbn(), title: TITLE });
});

test.afterAll(async () => {
  await deleteItem(item.id);
});

test("Import DILICOM : le bouton Envoyer s'active et l'import aboutit", async ({
  page,
}) => {
  await login(page);
  await page.goto("/advanced");

  const csv = [
    "EAN,TITRE,AUTEUR,EDITEUR,DISTRIBUTEUR,PRIX,DISPO,REF.LIGNE,QTE,TOTAL",
    `${item.isbn},${TITLE},Auteur,Editeur,Distributeur,12,,,2,`,
  ].join("\n");

  await page.locator('input[type="file"]').setInputFiles({
    name: "dilicom.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(csv),
  });

  const submit = page.getByRole("button", { name: "Envoyer" });
  await expect(submit).toBeEnabled();
  await submit.click();

  await expect(page.getByText(TITLE)).toBeVisible();
  await page.getByRole("button", { name: "Valider" }).click();
  await expect(
    page.getByText("Le fichier a été importé correctement (2 articles)."),
  ).toBeVisible();
});
