const hasUniqueViolationCode = (value: unknown): boolean => {
  if (typeof value !== "object" || value === null || !("code" in value)) {
    return false;
  }
  return value.code === "23505";
};

/**
 * Detects a PostgreSQL unique-constraint violation (SQLSTATE 23505). Drizzle
 * wraps driver errors in a `DrizzleQueryError`, so the code may live on the
 * error itself or on its `cause`.
 */
export const isUniqueViolation = (error: unknown): boolean => {
  if (hasUniqueViolationCode(error)) {
    return true;
  }
  if (typeof error !== "object" || error === null || !("cause" in error)) {
    return false;
  }
  return hasUniqueViolationCode(error.cause);
};
