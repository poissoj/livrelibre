import { expect, test } from "@playwright/test";

import { E2E_USER } from "./e2e-user";

test("Identifiants invalides", async ({ page }) => {
  await page.goto(`/login`);
  await page.getByLabel("Identifiant").click();
  await page.getByLabel("Identifiant").fill("test");
  await page.getByLabel("Mot de passe").click();
  await page.getByLabel("Mot de passe").fill("test");
  await page.getByRole("button", { name: "Connexion" }).click();
  await expect(page.getByText("Identifiants invalides")).toBeVisible();
});

test("Redirige vers /login si non authentifié", async ({ page }) => {
  await page.goto(`/`);
  await expect(page).toHaveURL("/login");
});

test("Identifiants valides", async ({ page }) => {
  await page.goto(`/login`);
  await page.getByLabel("Identifiant").click();
  await page.getByLabel("Identifiant").fill(E2E_USER.name);
  await page.getByLabel("Mot de passe").click();
  await page.getByLabel("Mot de passe").fill(E2E_USER.password);
  await page.getByRole("button", { name: "Connexion" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "Livre Libre" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Se déconnecter" }),
  ).toBeVisible();
});

test("Redirige un utilisateur connecté hors de /login", async ({ page }) => {
  await page.goto(`/login`);
  await page.getByLabel("Identifiant").click();
  await page.getByLabel("Identifiant").fill(E2E_USER.name);
  await page.getByLabel("Mot de passe").click();
  await page.getByLabel("Mot de passe").fill(E2E_USER.password);
  await page.getByRole("button", { name: "Connexion" }).click();
  await expect(page).toHaveURL("/");

  await page.goto(`/login`);
  await expect(page).toHaveURL("/");
});
