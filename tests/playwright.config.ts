import { defineConfig, devices } from "@playwright/test";

import { getTestDatabaseUri } from "./test-db.mts";

const e2eDatabaseUrl = getTestDatabaseUri();

/**
 * See https://playwright.dev/docs/test-configuration.
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
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://127.0.0.1:5174",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
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
        SESSION_SECRET: "test-session-secret-test-session-secret",
      },
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "pnpm --filter @livrelibre/web dev",
      url: "http://127.0.0.1:5174",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
