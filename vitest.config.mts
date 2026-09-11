import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@server": fileURLToPath(new URL("./apps/server/src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    setupFiles: ["./tests/vitest.setup.ts"],
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
  },
});
