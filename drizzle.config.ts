import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { fileURLToPath } from "node:url";

config({
  path: fileURLToPath(new URL("./apps/server/.env.local", import.meta.url)),
});

export default defineConfig({
  dialect: "postgresql",
  out: "./apps/server/src/db/migrations",
  schema: "./packages/shared/src/schema.ts",
  dbCredentials: {
    url: process.env.POSTGRES_URI!,
  },
});
