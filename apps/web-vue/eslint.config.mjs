import prettierConfig from "eslint-config-prettier/flat";
import pluginVue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";
import vueParser from "vue-eslint-parser";

export default tseslint.config(
  {
    ignores: ["dist/**", "vite.config.ts", "eslint.config.mjs"],
  },
  ...tseslint.configs.strictTypeChecked,
  ...pluginVue.configs["flat/recommended"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: [".vue"],
      },
    },
    rules: {
      "vue/define-macros-order": "error",
      "vue/component-name-in-template-casing": ["error", "PascalCase"],
      "vue/no-undef-components": "error",
      "vue/no-unused-properties": ["warn", { groups: ["props"] }],
      "vue/require-typed-ref": "error",
      "vue/no-export-in-script-setup": "error",
      "vue/prefer-import-from-vue": "error",
    },
  },
  {
    files: ["**/*.{ts,vue}"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: [".vue"],
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { ignoreRestSiblings: true },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/no-deprecated": "error",
      "@typescript-eslint/no-unnecessary-template-expression": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
    },
  },
  {
    // Les déclarations ambiantes (.d.ts) doivent utiliser `interface`
    // pour le declaration merging (ex. ImportMetaEnv de Vite).
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
    },
  },
  prettierConfig,
);
