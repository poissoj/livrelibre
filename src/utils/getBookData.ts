import * as cheerio from "cheerio";
import { got } from "got";

export type BookData = { title: string; author: string; publisher: string };

export const getBookData = async (isbn: string): Promise<BookData> => {
  if (!process.env.ISBN_SEARCH_URL) {
    throw new Error("ISBN_SEARCH_URL is not set");
  }
  const url = process.env.ISBN_SEARCH_URL + isbn;
  const body = await got(url).text();
  const $ = cheerio.load(body);
  const mainInfos = $(".main-infos [itemprop=name]");
  if (mainInfos.length > 0) {
    const title = mainInfos.text().trim();
    // TODO: handle multiple authors
    const author = $(".main-infos [itemprop=author]").eq(0).text().trim();
    const publisher = $(".main-infos > h3 > a").text().trim();
    return { title, author, publisher };
  } else {
    return { title: "", author: "", publisher: "" };
  }
};
