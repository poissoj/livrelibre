import { config } from "dotenv";

import { migrateDatabase } from "@livrelibre/server/db/migrate";

export default async function globalSetup() {
  config({ path: ".env.local" });
  const uri = process.env.TEST_POSTGRES_URI ?? process.env.POSTGRES_URI;
  if (!uri) {
    throw new Error("No test database URI configured (TEST_POSTGRES_URI)");
  }
  await migrateDatabase(uri);
}
