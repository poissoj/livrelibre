import { z } from "zod";

const envSchema = z.object({
  APP_URL: z.url().optional(),
  COOKIE_PASSWORD: z.string().min(32),
  ISBN_SEARCH_URL: z.url().optional(),
  LOG_LEVEL: z.string().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().optional(),
  AUTHORIZED_DOMAINS: z.string().optional(),
  POSTGRES_URI: z.string().startsWith("postgres://"),
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
