import { fileURLToPath } from "node:url";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { config } from "dotenv";
import postgres from "postgres";

export default async function globalSetup() {
  config({ path: ".env.local" });
  const uri = process.env.TEST_POSTGRES_URI ?? process.env.POSTGRES_URI;
  if (!uri) {
    throw new Error("No test database URI configured (TEST_POSTGRES_URI)");
  }
  const client = postgres(uri);
  await migrate(drizzle(client), {
    migrationsFolder: fileURLToPath(
      new URL("../../src/db/migrations", import.meta.url),
    ),
  });
  await client.end();
}
