import { fileURLToPath } from "node:url";

import { config } from "dotenv";
import { z } from "zod";

config({
  path: fileURLToPath(new URL("../../../.env.local", import.meta.url)),
});

const envSchema = z.object({
  SESSION_SECRET: z.string().min(32),
  POSTGRES_URI: z.string().startsWith("postgres://"),
  APP_URL: z.url().optional(),
  ISBN_SEARCH_URL: z.url().optional(),
  LOG_LEVEL: z.string().optional(),
  AUTHORIZED_DOMAINS: z.string().optional(),
  PORT: z.string().optional(),
});

const envParsed = envSchema.safeParse(process.env);

if (!envParsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(z.treeifyError(envParsed.error), null, 4),
  );
  process.exit(1);
}

export const env = envParsed.data;
