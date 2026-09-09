import { fileURLToPath } from "node:url";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

export const migrateDatabase = async (uri: string) => {
  const client = postgres(uri);
  await migrate(drizzle(client), {
    migrationsFolder: fileURLToPath(new URL("./migrations", import.meta.url)),
  });
  await client.end();
};
