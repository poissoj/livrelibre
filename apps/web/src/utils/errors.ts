import { isTRPCClientError } from "@trpc/client";

import type { AppRouter } from "@livrelibre/server/router";

export const getErrorMessage = (
  error: unknown,
  fallback = "Une erreur est survenue",
): string => {
  if (isTRPCClientError<AppRouter>(error)) {
    const issues = error.data?.issues;
    if (issues && issues.length > 0) {
      return issues.map((issue) => issue.message).join(" · ");
    }
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};
