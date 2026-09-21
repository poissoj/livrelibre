import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

import { getTestDatabaseUri } from "./tests/test-db.mts";

export default defineConfig({
  resolve: {
    alias: {
      "@server": fileURLToPath(new URL("./apps/server/src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    env: { POSTGRES_URI: getTestDatabaseUri() },
    globalSetup: ["./tests/integration/global-setup.ts"],
    setupFiles: ["./tests/vitest.setup.ts"],
    include: ["tests/integration/**/*.test.ts"],
    fileParallelism: false,
  },
});
