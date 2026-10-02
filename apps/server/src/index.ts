import { serve } from "@hono/node-server";

import { app } from "./app";
import { env } from "./env";
import { logger } from "./utils/logger";

logger.info(`Livre Libre server listening on http://localhost:${env.PORT}`);
serve({ fetch: app.fetch, port: env.PORT });
