import { parse } from "dotenv";
import { existsSync, readFileSync } from "node:fs";

const TEST_ENV_FILE = new URL("./.env.test", import.meta.url);
const SERVER_ENV_FILE = new URL("../apps/server/.env.local", import.meta.url);

export const getTestDatabaseUri = (): string => {
  const testEnv = existsSync(TEST_ENV_FILE)
    ? parse(readFileSync(TEST_ENV_FILE))
    : {};
  const uri = testEnv.POSTGRES_URI;
  if (!uri) {
    throw new Error(
      "POSTGRES_URI must be set in tests/.env.test to run database tests (see tests/.env.test.example).",
    );
  }
  const serverEnv = existsSync(SERVER_ENV_FILE)
    ? parse(readFileSync(SERVER_ENV_FILE))
    : {};
  if (uri === serverEnv.POSTGRES_URI) {
    throw new Error(
      "The test database in tests/.env.test must be different from the POSTGRES_URI in apps/server/.env.local.",
    );
  }
  return uri;
};
