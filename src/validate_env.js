// @ts-check
const { z } = require("zod");

const envSchema = z.object({
  APP_URL: z.string().url().optional(),
  COOKIE_PASSWORD: z.string().min(32),
  ISBN_SEARCH_URL: z.string().url().optional(),
  LOG_LEVEL: z.string().optional(),
  NEXT_PUBLIC_APP_NAME: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  AUTHORIZED_DOMAINS: z.string().optional(),
  POSTGRES_URI: z.string().startsWith("postgres://"),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(env.error.format(), null, 4),
  );
  process.exit(1);
}

module.exports.env = env.data;
