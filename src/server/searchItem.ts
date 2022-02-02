import type { DBItem, ItemWithCount } from "@/utils/item";
import { norm } from "@/utils/utils";
import { Filter, ObjectId } from "mongodb";
import { getDb } from "./database";

export const getItem = async (id: string): Promise<ItemWithCount | null> => {
  if (!/^[a-f\d]{24}$/i.test(id)) {
    throw new Error("Invalid id");
  }
  const _id = new ObjectId(id);
  const db = await getDb();
  const item = await db.collection<DBItem>("books").findOne({ _id });
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

const generateQuickSearchCriteria = (search: string) => {
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

const NORMALIZED_FIELDS = ["author", "title", "publisher", "distributor"];
const IGNORECASE_FIELDS = [
  "author",
  "title",
  "keywords",
  "comments",
  "publisher",
  "distributor",
];

const capitalize = (txt: string) =>
  txt ? `${txt[0].toUpperCase()}${txt.slice(1)}` : "";

const generateSearchCriteria = (query: Record<string, string>) => {
  const criteria: Record<string, string | RegExp | number>[] = [];
  for (const field in query) {
    let key = field;
    let value: string | RegExp | number = query[field];
    if (value === "") continue;
    if (NORMALIZED_FIELDS.includes(field)) {
      key = `nm${capitalize(field)}`;
      value = norm(value);
    }
    if (IGNORECASE_FIELDS.includes(field)) {
      value = new RegExp(sanitize(value), "i");
    }
    if (field === "amount") {
      value = Number(value);
    }
    criteria.push({ [key]: value });
  }
  if (criteria.length === 0) {
    criteria.push({});
  }
  return { $and: criteria };
};

const ITEMS_PER_PAGE = 50;

const doSearch = async (criteria: Filter<DBItem>, pageNumber: number) => {
  const db = await getDb();
  const count = await db.collection<DBItem>("books").countDocuments(criteria);
  const dbItems = await db
    .collection<DBItem>("books")
    .find(criteria)
    .sort({ title: 1 })
    .skip((pageNumber - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
    .toArray();
  const items = dbItems.map((item) => ({ ...item, _id: item._id.toString() }));
  return { items, count };
};

export const searchItems = async (input: string, pageNumber = 1) => {
  const search = input.trim();
  const criteria = generateQuickSearchCriteria(search);
  return await doSearch(criteria, pageNumber);
};

export const advancedSearch = async (
  query: Record<string, string>,
  pageNumber = 1
) => {
  const criteria = generateSearchCriteria(query);
  return await doSearch(criteria, pageNumber);
};
