import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

import { getTestDatabaseUri } from "./test-db.mts";

export default defineConfig({
  resolve: {
    alias: {
      "@server": fileURLToPath(new URL("../apps/server/src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    env: { POSTGRES_URI: getTestDatabaseUri() },
    globalSetup: ["./integration/global-setup.ts"],
    setupFiles: ["./vitest.setup.ts"],
    include: ["integration/**/*.test.ts"],
    fileParallelism: false,
  },
});
