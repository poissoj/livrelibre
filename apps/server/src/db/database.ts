import * as schema from "@livrelibre/shared/schema";
import { env } from "@server/env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const queryClient = postgres(env.POSTGRES_URI, {
  connection: { timezone: env.TIMEZONE },
  max: env.DB_POOL_MAX,
  idle_timeout: env.DB_IDLE_TIMEOUT,
  connect_timeout: env.DB_CONNECT_TIMEOUT,
  max_lifetime: env.DB_MAX_LIFETIME,
});
export const db = drizzle(queryClient, { schema });

export const closeDatabase = async () => {
  await queryClient.end({ timeout: 5 });
};

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
