import bcrypt from "bcrypt";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { join } from "node:path";
import postgres from "postgres";

import { users } from "@livrelibre/shared/schema";

export default async function globalSetup() {
  config({ path: ".env.local" });
  const uri = process.env.TEST_POSTGRES_URI ?? process.env.POSTGRES_URI;
  if (!uri) {
    throw new Error("No test database URI configured (TEST_POSTGRES_URI)");
  }

  const client = postgres(uri);
  const db = drizzle(client);
  await migrate(db, {
    migrationsFolder: join(process.cwd(), "apps/server/src/db/migrations"),
  });

  const { USER_NAME, USER_PASSWORD } = process.env;
  if (USER_NAME && USER_PASSWORD) {
    const hash = await bcrypt.hash(USER_PASSWORD, 12);
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.name, USER_NAME));
    if (existing.length === 0) {
      await db.insert(users).values({ name: USER_NAME, hash, role: "admin" });
    } else {
      await db.update(users).set({ hash }).where(eq(users.name, USER_NAME));
    }
  }

  await client.end();
}
