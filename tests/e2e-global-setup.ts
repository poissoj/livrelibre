import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { join } from "node:path";
import postgres from "postgres";

import { users } from "@livrelibre/shared/schema";

import { E2E_USER } from "./e2e-user";
import { getTestDatabaseUri } from "./test-db.mts";

export default async function globalSetup() {
  const uri = getTestDatabaseUri();

  const client = postgres(uri);
  const db = drizzle(client);
  await migrate(db, {
    migrationsFolder: join(process.cwd(), "apps/server/src/db/migrations"),
  });

  const hash = await bcrypt.hash(E2E_USER.password, 12);
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.name, E2E_USER.name));
  if (existing.length === 0) {
    await db.insert(users).values({ name: E2E_USER.name, hash, role: "admin" });
  } else {
    await db.update(users).set({ hash }).where(eq(users.name, E2E_USER.name));
  }

  await client.end();
}
