import { fileURLToPath } from "node:url";

import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({
  path: fileURLToPath(new URL(".env.local", import.meta.url)),
});

const url = process.env.POSTGRES_URI;
if (!url) {
  throw new Error("POSTGRES_URI is required to run drizzle-kit");
}

export default defineConfig({
  dialect: "postgresql",
  out: "./src/db/migrations",
  schema: "../../packages/shared/src/schema.ts",
  dbCredentials: { url },
});
