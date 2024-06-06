module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/strict-type-checked",
  ],
  ignorePatterns: [
    ".eslintrc.js",
    "*.config.js",
    "validate_env.js",
    "*.spec.ts",
  ],
  rules: {
    "@typescript-eslint/no-misused-promises": [
      "error",
      { checksVoidReturn: false },
    ],
    "@typescript-eslint/no-unnecessary-condition": "warn",
    "@typescript-eslint/restrict-template-expressions": [
      "warn",
      { allowNumber: true },
    ],
  },
};
