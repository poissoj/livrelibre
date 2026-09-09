import { beforeEach, describe, expect, it } from "vitest";

import { eq } from "drizzle-orm";

import { db } from "@/db/database";
import { items } from "@livrelibre/shared/schema";
import { getBookmarks, starItem } from "@/server/bookmarks";
import { seedItem, truncateAll } from "./helpers";

describe("bookmarks", () => {
  beforeEach(truncateAll);

  it("getBookmarks returns only starred items, ordered by title", async () => {
    await seedItem({ isbn: "9780000000001", title: "B", starred: true });
    await seedItem({ isbn: "9780000000002", title: "A", starred: true });
    await seedItem({ isbn: "9780000000003", title: "C", starred: false });

    const bookmarks = await getBookmarks();
    expect(bookmarks).toHaveLength(2);
    expect(bookmarks.map((b) => b.title)).toEqual(["A", "B"]);
  });

  it("starItem toggles the starred flag", async () => {
    const item = await seedItem({ starred: false });

    await starItem(item.id, true);
    const starred = await db.query.items.findFirst({
      where: eq(items.id, item.id),
    });
    expect(starred?.starred).toBe(true);

    await starItem(item.id, false);
    const unstarred = await db.query.items.findFirst({
      where: eq(items.id, item.id),
    });
    expect(unstarred?.starred).toBe(false);
  });
});
