import { ERROR_CODES } from "@livrelibre/shared/errors";
import { type User } from "@server/auth";
import { getBookData } from "@server/utils/getBookData";
import { logError, logWarn } from "@server/utils/logError";
import { logger } from "@server/utils/logger";
import { HTTPError } from "got";
import type { Context } from "hono";

export const bookRoute = async (c: Context) => {
  const isbn = c.req.param("isbn");
  const user = c.get("user") as User;
  if (user.role === "anonymous") {
    return c.json({ error: ERROR_CODES.UNAUTHENTICATED }, 401);
  }
  if (!isbn || !/^\d{10,13}$/.test(isbn)) {
    logger.info("Invalid ISBN parameter", { isbn, user });
    return c.json({ error: ERROR_CODES.INVALID_PARAMETER }, 400);
  }
  logger.info("Fetch book data", { isbn, user });
  try {
    const data = await getBookData(isbn);
    logger.info("Book data fetched", { isbn, user });
    if (data === null) {
      return c.json({ error: ERROR_CODES.BOOK_NOT_FOUND }, 404);
    }
    return c.json(data);
  } catch (error) {
    if (error instanceof HTTPError) {
      if (error.response.statusCode === 404) {
        logWarn("getBookData.notFound", error, { isbn, user });
        return c.json({ error: ERROR_CODES.BOOK_NOT_FOUND }, 404);
      }
      logError("getBookData", error, { isbn, user });
      return c.json({ error: ERROR_CODES.BOOK_FETCH_FAILED }, 500);
    }
    logError("getBookData", error, { isbn, user });
    return c.json({ error: ERROR_CODES.BOOK_FETCH_FAILED }, 500);
  }
};
