import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

if (!process.env.POSTGRES_URI) {
  throw new Error("Please provide POSTGRES_URI env var");
}

const queryClient = postgres(process.env.POSTGRES_URI);
export const db = drizzle(queryClient, { schema });
