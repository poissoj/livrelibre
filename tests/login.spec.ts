import { expect, test } from "@playwright/test";
import { config } from "dotenv";

config({ path: ".env.local" });
const { USER_NAME, USER_PASSWORD } = process.env;

test("Identifiants invalides", async ({ page }) => {
  await page.goto(`/login`);
  await page.getByLabel("Identifiant").click();
  await page.getByLabel("Identifiant").fill("test");
  await page.getByLabel("Mot de passe").click();
  await page.getByLabel("Mot de passe").fill("test");
  await page.getByRole("button", { name: "Connexion" }).click();
  await expect(page.getByText("Identifiants invalides")).toBeVisible();
});

test("Identifiants valides", async ({ page }) => {
  await page.goto(`/login`);
  await page.getByLabel("Identifiant").click();
  await page.getByLabel("Identifiant").fill(USER_NAME);
  await page.getByLabel("Mot de passe").click();
  await page.getByLabel("Mot de passe").fill(USER_PASSWORD);
  await page.getByRole("button", { name: "Connexion" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "Livre Libre" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Se déconnecter" }),
  ).toBeVisible();
});
