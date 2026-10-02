import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@livrelibre/shared/schema";

import { env } from "@server/env";

const queryClient = postgres(env.POSTGRES_URI, {
  connection: { timezone: env.TIMEZONE },
});
export const db = drizzle(queryClient, { schema });

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
