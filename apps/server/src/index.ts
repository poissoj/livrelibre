import { serve } from "@hono/node-server";

import { app } from "./app";
import { closeDatabase } from "./db/database";
import { env } from "./env";
import { logger } from "./utils/logger";

const SHUTDOWN_TIMEOUT_MS = 10_000;

const server = serve({ fetch: app.fetch, port: env.PORT });
logger.info("Server listening", { port: env.PORT });

let shuttingDown = false;

const shutdown = async (signal: NodeJS.Signals) => {
  if (shuttingDown) {
    logger.warn("Forced shutdown", { signal });
    process.exit(1);
  }
  shuttingDown = true;
  logger.info("Shutting down", { signal });

  // Force exit if in-flight requests never settle.
  setTimeout(() => {
    logger.error("Shutdown timed out, forcing exit");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS).unref();

  server.close();
  if ("closeIdleConnections" in server) {
    server.closeIdleConnections();
  }
  await closeDatabase();
  logger.info("Shutdown complete", { signal });
  process.exit(0);
};

process.on("SIGTERM", (signal) => void shutdown(signal));
process.on("SIGINT", (signal) => void shutdown(signal));
