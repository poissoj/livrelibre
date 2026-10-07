import { env } from "@server/env";
import { createLogger, format, transports } from "winston";

const isProduction = env.NODE_ENV === "production";

const jsonFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json(),
);

const devFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: "HH:mm:ss" }),
  format.errors({ stack: true }),
  format.printf((info) => {
    const { timestamp, level, message } = info;
    const stack = typeof info.stack === "string" ? info.stack : "";
    const meta: Record<string, unknown> = { ...info };
    delete meta.timestamp;
    delete meta.level;
    delete meta.message;
    delete meta.stack;
    const extra = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
    const trace = stack ? `\n${stack}` : "";
    return `${String(timestamp)} ${level}: ${String(message)}${extra}${trace}`;
  }),
);

export const logger = createLogger({
  level: env.LOG_LEVEL,
  format: isProduction ? jsonFormat : devFormat,
  transports: [new transports.Console()],
});
