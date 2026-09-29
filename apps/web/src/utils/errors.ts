import { isTRPCClientError } from "@trpc/client";

import type { AppRouter } from "@livrelibre/server/router";
import { ERROR_MESSAGES } from "@livrelibre/shared/errors";

const NETWORK_MESSAGE =
  "Impossible de contacter le serveur. Vérifiez votre connexion.";
const INVALID_VALUE_MESSAGE = "Valeur invalide.";
const TOO_MANY_REQUESTS_MESSAGE = "Trop de requêtes, merci de patienter.";
const TIMEOUT_MESSAGE = "Le serveur met trop de temps à répondre.";
const DEFAULT_FALLBACK = "Une erreur est survenue.";

const STRUCTURAL_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: ERROR_MESSAGES.UNAUTHORIZED,
  FORBIDDEN: ERROR_MESSAGES.FORBIDDEN,
  INTERNAL_SERVER_ERROR: ERROR_MESSAGES.INTERNAL_ERROR,
  TOO_MANY_REQUESTS: TOO_MANY_REQUESTS_MESSAGE,
  TIMEOUT: TIMEOUT_MESSAGE,
};

/**
 * Traduit un identifiant d'erreur émis par l'API en message utilisateur.
 * Retourne `undefined` si le code est inconnu.
 */
export const translateErrorCode = (code: string): string | undefined =>
  Object.hasOwn(ERROR_MESSAGES, code)
    ? ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES]
    : undefined;

/** Détecte un échec réseau (fetch/offline), par opposition à une erreur serveur. */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof TypeError) {
    return true;
  }
  const message = error instanceof Error ? error.message : "";
  return /failed to fetch|network ?error|load failed|fetch failed/i.test(
    message,
  );
};

/**
 * Normalise une erreur (tRPC, réseau, inconnue) en message utilisateur français.
 * Les messages techniques ne sont jamais exposés.
 */
export const getErrorMessage = (
  error: unknown,
  fallback: string = DEFAULT_FALLBACK,
): string => {
  if (isTRPCClientError<AppRouter>(error)) {
    const issues = error.data?.issues;
    if (issues && issues.length > 0) {
      return issues
        .map(
          (issue) => translateErrorCode(issue.message) ?? INVALID_VALUE_MESSAGE,
        )
        .join(" · ");
    }
    const code = error.data?.code;
    const structural = code ? STRUCTURAL_MESSAGES[code] : undefined;
    if (structural) {
      return structural;
    }
    const translated = error.message
      ? translateErrorCode(error.message)
      : undefined;
    if (translated) {
      return translated;
    }
    if (isNetworkError(error)) {
      return NETWORK_MESSAGE;
    }
    return fallback;
  }
  if (isNetworkError(error)) {
    return NETWORK_MESSAGE;
  }
  return fallback;
};

/** Extrait et traduit le code d'erreur d'une réponse REST (`{ error: code }`). */
export const getRestErrorMessage = (
  body: unknown,
  fallback: string = DEFAULT_FALLBACK,
): string => {
  if (body && typeof body === "object" && "error" in body) {
    const code = body.error;
    if (typeof code === "string") {
      return translateErrorCode(code) ?? fallback;
    }
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
