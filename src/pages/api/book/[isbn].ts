import { withIronSessionApiRoute } from "iron-session/next";
import type { NextApiHandler } from "next";

import { sessionOptions } from "@/lib/session";
import { getBookData } from "@/utils/getBookData";
import { logger } from "@/utils/logger";

const getBookDataRoute: NextApiHandler = async (req, res) => {
  const { isbn } = req.query;
  const { user } = req.session;
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
    res.status(500).json({ error: "Unable to get book data" });
  }
};

export default withIronSessionApiRoute(getBookDataRoute, sessionOptions);
