import { fileURLToPath } from "node:url";

import { config } from "dotenv";
import { z } from "zod";

config({
  path: fileURLToPath(new URL("../.env.local", import.meta.url)),
});

const envSchema = z.object({
  SESSION_SECRET: z.string().min(32),
  POSTGRES_URI: z.string().regex(/^postgres(ql)?:\/\//),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  ISBN_SEARCH_URL: z.url().optional(),
  LOG_LEVEL: z.enum(["error", "warn", "info", "http", "verbose", "debug", "silly"]).default("info"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  TIMEZONE: z.string().min(1).default("Europe/Paris"),
  // CLI-only variables (see src/cli)
  SHOP_ID: z.string().optional(),
  FTP_HOST: z.string().optional(),
  FTP_USER: z.string().optional(),
  FTP_PASSWORD: z.string().optional(),
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

// Align Node date formatting (date-fns, formatDate, toLocaleDateString) with the
// timezone used by Postgres sessions (see db/database.ts).
process.env.TZ = env.TIMEZONE;
