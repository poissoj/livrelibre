import { config } from "dotenv";

config({ path: ".env.local" });
process.env.POSTGRES_URI =
  process.env.TEST_POSTGRES_URI ?? process.env.POSTGRES_URI;
