import * as cheerio from "cheerio";
import got from "got";

import { env } from "@server/env";
import { logger } from "@server/utils/logger";

export type BookData = { title: string; author: string; publisher: string };

export const getBookData = async (isbn: string): Promise<BookData | null> => {
  if (!env.ISBN_SEARCH_URL) {
    throw new Error("ISBN_SEARCH_URL is not set");
  }
  if (!/^\d{10,13}$/.test(isbn)) {
    return null;
  }
  const url = env.ISBN_SEARCH_URL + isbn;
  try {
    const body = await got(url, {
      timeout: { request: 5000 },
      retry: { limit: 1 },
    }).text();
    const $ = cheerio.load(body);
    const details = $(".product-details");
    if (details.length > 0) {
      const title = details.find("[itemprop=name]").text().trim();
      // TODO: handle multiple authors
      const author = details.find("[itemprop=author]").eq(0).text().trim();
      const publisher = details.find("[itemprop=publisher]").text().trim();
      return { title, author, publisher };
    }
  } catch (error) {
    logger.error(error);
  }
  return null;
};
