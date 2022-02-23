import * as cheerio from "cheerio";
import { got } from "got";
import { withIronSessionApiRoute } from "iron-session/next";
import type { NextApiHandler } from "next";

import { sessionOptions } from "@/lib/session";
import { logger } from "@/utils/logger";

export type BookData = { title: string; author: string; publisher: string };

const getBookData = async (isbn: string): Promise<BookData> => {
  if (!process.env.ISBN_SEARCH_URL) {
    throw new Error("ISBN_SEARCH_URL is not set");
  }
  const url = process.env.ISBN_SEARCH_URL + isbn;
  const body = await got(url).text();
  const $ = cheerio.load(body);
  if ($(".main-infos [itemprop=name]")) {
    const title = $(".main-infos [itemprop=name]").text().trim();
    // TODO: handle multiple authors
    const author = $(".main-infos [itemprop=author]").eq(0).text().trim();
    const publisher = $(".main-infos > h3 > a").text().trim();
    return { title, author, publisher };
  } else {
    return { title: "", author: "", publisher: "" };
  }
};

const getBookDataRoute: NextApiHandler = async (req, res) => {
  const { isbn } = req.query;
  const { user } = req.session;
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
