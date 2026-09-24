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

/**
 * Les erreurs tRPC sont déjà présentées à l'utilisateur par le cache
 * query/mutation (onError). Toute autre erreur est un bug : ne pas la cacher.
 */
export const logUnexpectedError = (error: unknown): void => {
  if (!isTRPCClientError(error)) {
    console.error(error);
  }
};
