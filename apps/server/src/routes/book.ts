import { HTTPError } from "got";
import type { Context } from "hono";

import { ERROR_CODES } from "@livrelibre/shared/errors";

import { type User } from "@server/auth";
import { getBookData } from "@server/utils/getBookData";
import { logger } from "@server/utils/logger";

export const bookRoute = async (c: Context) => {
  const isbn = c.req.param("isbn");
  const user = c.get("user") as User;
  if (user.role === "anonymous") {
    return c.json({ error: ERROR_CODES.UNAUTHENTICATED }, 401);
  }
  if (!isbn || !/^\d{10,13}$/.test(isbn)) {
    logger.info("Get book data: invalid parameter", { isbn, user });
    return c.json({ error: ERROR_CODES.INVALID_PARAMETER }, 400);
  }
  logger.info("Fetch book data", { isbn, user });
  try {
    const data = await getBookData(isbn);
    logger.info("Got book data", { isbn, user, data });
    return c.json(data);
  } catch (error) {
    logger.error(error);
    if (
      error instanceof HTTPError &&
      error.code === "ERR_NON_2XX_3XX_RESPONSE"
    ) {
      return c.json({ error: ERROR_CODES.BOOK_NOT_FOUND }, 404);
    }
    return c.json({ error: ERROR_CODES.BOOK_FETCH_FAILED }, 500);
  }
};
