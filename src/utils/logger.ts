import { createLogger, format, transports } from "winston";

const consoleTransport = new transports.Console({
  level: process.env.LOG_LEVEL || "info",
  format: format.combine(format.colorize(), format.simple()),
});

export const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [consoleTransport],
});
