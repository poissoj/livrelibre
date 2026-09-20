import { serve } from "@hono/node-server";

import { app } from "./app";
import { env } from "./env";
import { logger } from "./utils/logger";

const port = Number(env.PORT ?? 3001);
logger.info(`Livre Libre server listening on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
