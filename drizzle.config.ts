import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  out: "./src/db/migrations",
  schema: "./src/db/schema.ts",
});
