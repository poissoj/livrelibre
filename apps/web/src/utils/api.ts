import { getRestErrorMessage } from "./errors";

const INVALID_RESPONSE_MESSAGE = "Réponse du serveur invalide.";

/** Error thrown by `apiFetch` for non-ok responses or invalid payloads. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;

  constructor(status: number, code: string | undefined, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

const extractErrorCode = (body: unknown): string | undefined => {
  if (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof body.error === "string"
  ) {
    return body.error;
  }
  return undefined;
};

/**
 * Calls a REST endpoint, translates error bodies to user-facing messages and
 * validates the success payload with a type guard.
 *
 * Network failures (`fetch` rejecting) are propagated as-is; callers can pass
 * them to `getErrorMessage`.
 */
export const apiFetch = async <T>(
  input: string,
  init: RequestInit,
  guard: (body: unknown) => body is T,
  fallback?: string,
): Promise<T> => {
  const response = await fetch(input, init);
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      response.status,
      extractErrorCode(body),
      getRestErrorMessage(body, fallback),
    );
  }
  if (!guard(body)) {
    throw new ApiError(response.status, undefined, INVALID_RESPONSE_MESSAGE);
  }
  return body;
};
