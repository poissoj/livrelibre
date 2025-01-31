import * as cheerio from "cheerio";
import { got } from "got";

export type BookData = { title: string; author: string; publisher: string };

export const getBookData = async (isbn: string): Promise<BookData | null> => {
  if (!process.env.ISBN_SEARCH_URL) {
    throw new Error("ISBN_SEARCH_URL is not set");
  }
  const url = process.env.ISBN_SEARCH_URL + isbn;
  try {
    const body = await got(url).text();
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
    console.error(error);
  }
  return null;
};
