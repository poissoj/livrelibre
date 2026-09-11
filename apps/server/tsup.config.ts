import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  bundle: true,
  clean: true,
  sourcemap: true,
  tsconfig: "tsconfig.json",
  noExternal: ["@livrelibre/shared"],
});
