import { SQL, and, count, eq, gt, or, sql, sum } from "drizzle-orm";

import { db } from "@/db/database";
import { type Item, items, sales } from "@/db/schema";
import { type ItemWithCount } from "@/utils/item";
import { logger } from "@/utils/logger";
import { ITEMS_PER_PAGE } from "@/utils/pagination";
import { norm, sanitize } from "@/utils/utils";

export const getItem = async (id: number): Promise<ItemWithCount | null> => {
  const item = await db.query.items.findFirst({ where: eq(items.id, id) });
  const salesCount = await db
    .select({
      total: sum(sales.quantity),
    })
    .from(sales)
    .where(and(eq(sales.itemId, id), eq(sales.deleted, false)));
  const count = salesCount.length > 0 ? Number(salesCount[0].total) : 0;
  return item ? { ...item, count } : null;
};

const generateQuickSearchCriteria = (search: string, inStock: boolean) => {
  let criteria: SQL | undefined;
  if (/^\d{13,}$/.test(search)) {
    criteria = eq(items.isbn, search.slice(0, 13));
  } else if (/\s/.test(search)) {
    const tokens = search.split(/\s+/).map((str) => sanitize(norm(str)));
    const titleCriteria = tokens.map((t) => sql`${items.nmTitle} ~* ${t}`);
    const authorCriteria = tokens.map((t) => sql`${items.nmAuthor} ~* ${t}`);
    criteria = or(and(...titleCriteria), and(...authorCriteria));
  } else {
    const crit = sanitize(norm(search));
    criteria = or(
      sql`${items.nmTitle} ~* ${crit}`,
      sql`${items.nmAuthor} ~* ${crit}`,
    );
  }
  if (inStock) {
    criteria = and(criteria, gt(items.amount, 0));
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
  const criteria: SQL[] = [];
  for (const field in query) {
    let key = field as keyof Item | "inStock";
    let value: string | RegExp | number = query[field];
    if (value === "" || key === "inStock") continue;
    let clause = eq(items[key], value);
    if (NORMALIZED_FIELDS.includes(field)) {
      key = `nm${capitalize(field)}` as keyof Item;
      clause = sql`${items[key]} = ${norm(value)}`;
    }
    if (IGNORECASE_FIELDS.includes(field)) {
      value = sanitize(norm(value));
      clause = sql`${items[key]} ~* ${value}`;
    }
    if (field === "amount") {
      clause = eq(items.amount, Number(value));
    }
    criteria.push(clause);
  }
  if (query.inStock) {
    criteria.push(gt(items.amount, 0));
  }
  return and(...criteria);
};

const doSearch = async (criteria: SQL | undefined, pageNumber: number) => {
  const qty = await db.select({ count: count() }).from(items).where(criteria);
  const dbItems = await db
    .select()
    .from(items)
    .where(criteria)
    .orderBy(items.title)
    .limit(ITEMS_PER_PAGE)
    .offset((pageNumber - 1) * ITEMS_PER_PAGE);
  return { items: dbItems, count: qty[0].count };
};

export const searchItems = async ({
  search: input,
  page = 1,
  inStock = false,
}: {
  search: string;
  inStock?: boolean;
  page?: number;
}) => {
  const search = input.trim();
  logger.info("Search", { search, page, inStock });
  const criteria = generateQuickSearchCriteria(search, inStock);
  return await doSearch(criteria, page);
};

export const advancedSearch = async (
  query: Record<string, string>,
  pageNumber = 1,
) => {
  logger.info("Advanced search", { query, pageNumber });
  const criteria = generateSearchCriteria(query);
  return await doSearch(criteria, pageNumber);
};

export const getItems = async ({ pageNumber = 1 }: { pageNumber?: number }) => {
  const data = await doSearch(undefined, pageNumber);
  const pageCount = Math.ceil(data.count / ITEMS_PER_PAGE);
  return { ...data, pageCount };
};
