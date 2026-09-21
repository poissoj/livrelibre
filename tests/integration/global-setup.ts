import { migrateDatabase } from "@livrelibre/server/db/migrate";

import { getTestDatabaseUri } from "../test-db.mts";

export default async function globalSetup() {
  await migrateDatabase(getTestDatabaseUri());
}
