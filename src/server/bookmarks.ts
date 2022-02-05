import type { ObjectId } from "mongodb";

import { getDb } from "@/server/database";

type BddBook = { _id: ObjectId; amount: number; title: string };

export type Bookmark = Omit<BddBook, "_id"> & { _id: string };

export const getBookmarks = async (): Promise<Bookmark[]> => {
  const db = await getDb();
  const books = db.collection("books");
  const bookmarks = await books
    .find({ starred: true })
    .project<BddBook>({ title: 1, amount: 1 })
    .sort({ title: 1 })
    .toArray();

  return bookmarks.map((bookmark) => ({
    ...bookmark,
    _id: bookmark._id.toString(),
  }));
};

export const starItem = async (_id: ObjectId, starred: boolean) => {
  const db = await getDb();
  return db.collection("books").updateOne({ _id }, { $set: { starred } });
};
