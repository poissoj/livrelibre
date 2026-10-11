import { advancedSearch, getItems } from "@livrelibre/server/server/searchItem";
import { beforeEach, describe, expect, it } from "vitest";

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

  it("filters by author, ignoring case and diacritics", async () => {
    await seedItem({ isbn: "9780000000001", author: "Émile Zola", nmAuthor: "emile zola" });
    await seedItem({ isbn: "9780000000002", author: "Autre", nmAuthor: "autre" });

    const { count } = await advancedSearch({ author: "émile zola" });
    expect(count).toBe(1);
  });

  it("filters by publisher and distributor (normalized)", async () => {
    await seedItem({
      isbn: "9780000000001",
      publisher: "Éditions du Seuil",
      nmPublisher: "editions du seuil",
      distributor: "Volumen",
      nmDistributor: "volumen",
    });
    await seedItem({ isbn: "9780000000002", nmPublisher: "autre", nmDistributor: "autre" });

    expect((await advancedSearch({ publisher: "éditions du seuil" })).count).toBe(1);
    expect((await advancedSearch({ distributor: "VOLUMEN" })).count).toBe(1);
  });

  it("filters by keywords and comments (case-insensitive)", async () => {
    await seedItem({ isbn: "9780000000001", keywords: "Policier", comments: "Coup de coeur" });
    await seedItem({ isbn: "9780000000002", keywords: "Science-fiction", comments: "Réassort" });

    expect((await advancedSearch({ keywords: "polic" })).count).toBe(1);
    expect((await advancedSearch({ comments: "coeur" })).count).toBe(1);
  });

  it("filters by price, accepting a comma decimal separator", async () => {
    await seedItem({ isbn: "9780000000001", price: "12.50" });
    await seedItem({ isbn: "9780000000002", price: "9.90" });

    expect((await advancedSearch({ price: "12,50" })).count).toBe(1);
  });

  it("filters by item type", async () => {
    await seedItem({ isbn: "9780000000001", type: "magazine" });
    await seedItem({ isbn: "9780000000002", type: "book" });

    expect((await advancedSearch({ type: "magazine" })).count).toBe(1);
  });

  it("restricts to items in stock", async () => {
    await seedItem({ isbn: "9780000000001", amount: 5 });
    await seedItem({ isbn: "9780000000002", amount: 0 });

    expect((await advancedSearch({ inStock: "1" })).count).toBe(1);
  });

  it("combines several fields with AND", async () => {
    await seedItem({
      isbn: "9780000000001",
      title: "Dune",
      nmTitle: "dune",
      author: "Herbert",
      nmAuthor: "herbert",
    });
    await seedItem({
      isbn: "9780000000002",
      title: "Dune",
      nmTitle: "dune",
      author: "Autre",
      nmAuthor: "autre",
    });

    const { count } = await advancedSearch({ title: "dune", author: "herbert" });
    expect(count).toBe(1);
  });

  it("ignores unknown fields instead of failing", async () => {
    await seedItem({ isbn: "9780000000001" });

    await expect(advancedSearch({ foo: "bar" })).resolves.toMatchObject({ count: 1 });
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
