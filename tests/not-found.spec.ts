import { expect, test } from "@playwright/test";
import { config } from "dotenv";

config({ path: ".env.local" });
const { USER_NAME, USER_PASSWORD } = process.env;

test("Affiche « introuvable » pour des entités inexistantes", async ({
  page,
}) => {
  if (!USER_NAME || !USER_PASSWORD) {
    test.skip(true, "USER_NAME / USER_PASSWORD absents du .env.local");
    return;
  }

  await page.goto(`/login`);
  await page.getByLabel("Identifiant").fill(USER_NAME);
  await page.getByLabel("Mot de passe").fill(USER_PASSWORD);
  await page.getByRole("button", { name: "Connexion" }).click();
  await expect(page).toHaveURL("/");

  await page.goto(`/customer/99999999`);
  await expect(page.getByText("Client introuvable")).toBeVisible();

  await page.goto(`/update/99999999`);
  await expect(page.getByText("Article introuvable")).toBeVisible();

  await page.goto(`/order/99999999`);
  await expect(page.getByText("Commande introuvable")).toBeVisible();
});
