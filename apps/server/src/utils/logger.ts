import { createLogger, format, transports } from "winston";

import { env } from "@server/env";

export const logger = createLogger({
  level: env.LOG_LEVEL ?? "info",
  format: format.combine(format.timestamp(), format.errors(), format.json()),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  ],
});
