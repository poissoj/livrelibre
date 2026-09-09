import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

export default defineConfig({
  dialect: "postgresql",
  out: "./apps/server/src/db/migrations",
  schema: "./packages/shared/src/schema.ts",
  dbCredentials: {
    url: process.env.POSTGRES_URI!,
  },
});
