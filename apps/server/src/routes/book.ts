import { HTTPError } from "got";
import type { Context } from "hono";

import { type User } from "@server/auth";
import { getBookData } from "@server/utils/getBookData";
import { logger } from "@server/utils/logger";

export const bookRoute = async (c: Context) => {
  const isbn = c.req.param("isbn");
  const user = c.get("user") as User;
  if (user.role === "anonymous") {
    return c.json({ error: "Unauthenticated" }, 401);
  }
  if (!isbn || !/^\d{10,13}$/.test(isbn)) {
    logger.info("Get book data: invalid parameter", { isbn, user });
    return c.json({ error: "Invalid parameter" }, 400);
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
      return c.json({ error: "No result" }, 404);
    }
    return c.json({ error: "Unable to get book data" }, 500);
  }
};
