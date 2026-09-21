import { parse } from "dotenv";
import { existsSync, readFileSync } from "node:fs";

export const getTestDatabaseUri = (): string => {
  const testEnv = existsSync(".env.test")
    ? parse(readFileSync(".env.test"))
    : {};
  const uri = testEnv.POSTGRES_URI;
  if (!uri) {
    throw new Error(
      "POSTGRES_URI must be set in .env.test to run database tests (see .env.test.example).",
    );
  }
  const localEnv = existsSync(".env.local")
    ? parse(readFileSync(".env.local"))
    : {};
  if (uri === localEnv.POSTGRES_URI) {
    throw new Error(
      "The test database in .env.test must be different from the POSTGRES_URI in .env.local.",
    );
  }
  return uri;
};
