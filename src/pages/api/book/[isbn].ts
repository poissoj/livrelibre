import { HTTPError } from "got";
import { getIronSession } from "iron-session";
import type { NextApiHandler } from "next";

import { type SessionData, sessionOptions } from "@/lib/session";
import { getBookData } from "@/utils/getBookData";
import { logger } from "@/utils/logger";

const getBookDataRoute: NextApiHandler = async (req, res) => {
  const { isbn } = req.query;
  const { user } = await getIronSession<SessionData>(req, res, sessionOptions);
  if (!user) {
    res.status(401).json({ error: "Unauthenticated" });
    return;
  }
  if (typeof isbn !== "string" || !/^\d{10,13}$/.test(isbn)) {
    logger.info("Get book data: invalid parameter", { isbn, user });
    res.status(400).json({ error: "Invalid parameter" });
    return;
  }
  logger.info("Fetch book data", { isbn, user });
  try {
    const data = await getBookData(isbn);
    logger.info("Got book data", { isbn, user, data });
    res.json(data);
  } catch (error) {
    logger.error(error);
    if (
      error instanceof HTTPError &&
      error.code === "ERR_NON_2XX_3XX_RESPONSE"
    ) {
      res.status(404).json({ error: "No result" });
      return;
    }
    res.status(500).json({ error: "Unable to get book data" });
  }
};

export default getBookDataRoute;
