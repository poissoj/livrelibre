import { getDb } from "@/server/database";

export type Bookmark = { _id: string; title: string };

export const getBookmarks = async (): Promise<Bookmark[]> => {
  const db = await getDb();
  const books = db.collection("books");
  const bookmarks = await books
    .find({ starred: true })
    .project<Bookmark>({ title: 1 })
    .sort({ title: 1 })
    .toArray();

  return bookmarks;
};
