import { getDb } from "@/server/database";
import type { ObjectId } from "mongodb";

export type Bookmark = { _id: string; title: string };

type BddBook = { _id: ObjectId; title: string };

export const getBookmarks = async (): Promise<Bookmark[]> => {
  const db = await getDb();
  const books = db.collection("books");
  const bookmarks = await books
    .find({ starred: true })
    .project<BddBook>({ title: 1 })
    .sort({ title: 1 })
    .toArray();

  return bookmarks.map((bookmark) => ({
    _id: bookmark._id.toString(),
    title: bookmark.title,
  }));
};

export const starItem = async (_id: ObjectId, starred: boolean) => {
  const db = await getDb();
  return db.collection("books").updateOne({ _id }, { $set: { starred } });
};
