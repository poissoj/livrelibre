import { defineConfig, devices } from "@playwright/test";

import { getTestDatabaseUri } from "./test-db.mts";

const e2eDatabaseUrl = getTestDatabaseUri();

/**
 * Config Playwright dédiée au front Vue (@livrelibre/web-vue, port 5174).
 * Voir playwright.config.ts pour le front React (port 5173).
 */
export default defineConfig({
  testDir: ".",
  /* Only run Playwright specs (Vitest uses .test.ts) */
  testMatch: "**/*.spec.ts",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* The e2e user shares cart/customer state across tests: run serially */
  workers: 1,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://127.0.0.1:5174",

    /* Collect trace when retrying the failed test. */
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Run the Hono API and Vite dev servers before starting the tests */
  globalSetup: "./e2e-global-setup.ts",
  webServer: [
    {
      command: "pnpm --filter @livrelibre/server dev",
      url: "http://127.0.0.1:3001/api/export",
      // Point the book lookup to an unbound local port: valid URL, no external call.
      env: {
        POSTGRES_URI: e2eDatabaseUrl,
        ISBN_SEARCH_URL: "http://127.0.0.1:9/",
      },
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "pnpm --filter @livrelibre/web-vue dev",
      url: "http://127.0.0.1:5174",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
