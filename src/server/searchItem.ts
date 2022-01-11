import type { Item, ItemWithCount } from "@/utils/item";
import { ObjectId } from "mongodb";
import { getDb } from "./database";

export const getItem = async (id: string): Promise<ItemWithCount | null> => {
  if (!/^[a-f\d]{24}$/i.test(id)) {
    throw new Error("Invalid id");
  }
  const _id = new ObjectId(id);
  const db = await getDb();
  const item = await db.collection<Item>("books").findOne({ _id });
  const salesCount = await db
    .collection("sales")
    .aggregate<{ total: number }>([
      { $match: { id: _id, deleted: { $exists: false } } },
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ])
    .toArray();
  const count = salesCount.length > 0 ? salesCount[0].total : 0;
  return item ? { ...item, _id: _id.toString(), count } : null;
};

const sanitize = (str: string) => str.replace(/[#-.]|[[-^]|[?|{}]/g, "\\$&");

// Remove diacritics
const norm = (str: string) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const generateQuickSearchCriteria = (search: string) => {
  // log.info('Search', search);
  let criteria;
  if (/^\d{13,}$/.test(search)) {
    criteria = { isbn: search.slice(0, 13) };
  } else if (/\s/.test(search)) {
    const titleCriteria = search
      .split(/\s+/)
      .map((str) => ({ nmTitle: new RegExp(sanitize(norm(str)), "i") }));
    const authorCriteria = titleCriteria.map((o) => ({ nmAuthor: o.nmTitle }));
    criteria = { $or: [{ $and: titleCriteria }, { $and: authorCriteria }] };
  } else {
    const crit = new RegExp(sanitize(norm(search)), "i");
    criteria = { $or: [{ nmTitle: crit }, { nmAuthor: crit }] };
  }
  return criteria;
};

const ITEMS_PER_PAGE = 50;

export const searchItems = async (input: string, pageNumber = 1) => {
  const search = input.trim();
  const criteria = generateQuickSearchCriteria(search);
  const db = await getDb();
  const count = await db.collection("books").countDocuments(criteria);
  const items = await db
    .collection<Item>("books")
    .find(criteria)
    .sort({ title: 1 })
    .skip((pageNumber - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .toArray();
  return { items, count };
};
