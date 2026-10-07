import { serve } from "@hono/node-server";

import { app } from "./app";
import { env } from "./env";
import { logger } from "./utils/logger";

logger.info("Server listening", { port: env.PORT });
serve({ fetch: app.fetch, port: env.PORT });
