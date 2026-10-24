import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  clean: true,
  sourcemap: true,
  tsconfig: "tsconfig.json",
  deps: {
    alwaysBundle: ["@livrelibre/shared/**"],
  },
  outExtensions: () => ({ js: ".js" }),
  dts: false,
  target: false,
});
