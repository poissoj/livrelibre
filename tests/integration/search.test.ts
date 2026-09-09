import { beforeEach, describe, expect, it } from "vitest";

import { advancedSearch, getItems } from "@livrelibre/server/server/searchItem";
import { seedItem, truncateAll } from "./helpers";

describe("advancedSearch", () => {
  beforeEach(truncateAll);

  it("filters items by title, ignoring case and diacritics", async () => {
    await seedItem({
      isbn: "9780000000001",
      title: "La Délicatesse",
      nmTitle: "La Delicatesse",
    });
    await seedItem({ isbn: "9780000000002", title: "Autre", nmTitle: "Autre" });

    const { count, items } = await advancedSearch({ title: "délicatesse" });
    expect(count).toBe(1);
    expect(items[0].title).toBe("La Délicatesse");
  });

  it("filters by exact amount", async () => {
    await seedItem({ isbn: "9780000000001", amount: 3 });
    await seedItem({ isbn: "9780000000002", amount: 7 });

    const { count } = await advancedSearch({ amount: "3" });
    expect(count).toBe(1);
  });
});

describe("getItems", () => {
  beforeEach(truncateAll);

  it("returns all items with a count and page count", async () => {
    await seedItem({ isbn: "9780000000001", title: "A", nmTitle: "a" });
    await seedItem({ isbn: "9780000000002", title: "B", nmTitle: "b" });

    const { items, count, pageCount } = await getItems({ pageNumber: 1 });
    expect(count).toBe(2);
    expect(pageCount).toBe(1);
    expect(items).toHaveLength(2);
  });
});
