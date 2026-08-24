import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    globalSetup: ["./tests/integration/global-setup.ts"],
    setupFiles: ["./tests/integration/setup-db.ts"],
    include: ["tests/integration/**/*.test.ts"],
    fileParallelism: false,
  },
});
