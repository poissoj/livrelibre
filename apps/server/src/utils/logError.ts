import { logger } from "./logger";

const toError = (error: unknown): Error =>
  error instanceof Error ? error : new Error(String(error));

export const logError = (
  operation: string,
  error: unknown,
  context: Record<string, unknown> = {},
) => {
  const err = toError(error);
  logger.error(err.message, {
    operation,
    name: err.name,
    stack: err.stack,
    ...context,
  });
};

export const logWarn = (
  operation: string,
  error: unknown,
  context: Record<string, unknown> = {},
) => {
  const err = toError(error);
  logger.warn(err.message, {
    operation,
    name: err.name,
    stack: err.stack,
    ...context,
  });
};
