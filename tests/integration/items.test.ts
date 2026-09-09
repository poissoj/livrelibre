import { beforeEach, describe, expect, it } from "vitest";

import { db } from "@/db/database";
import { items } from "@livrelibre/shared/schema";
import { addItem } from "@/server/addItem";
import { getItem, searchItems } from "@/server/searchItem";
import { updateItem } from "@/server/updateItem";
import { truncateAll } from "./helpers";

const baseItem = {
  type: "book" as const,
  isbn: "9780000000001",
  author: "Auteur",
  title: "Un Titre",
  publisher: "Éditeur",
  distributor: "Distributeur",
  keywords: null,
  datebought: "01/01/2024",
  comments: null,
  price: "10.00",
  amount: 5,
  tva: "5.5" as const,
};

describe("addItem", () => {
  beforeEach(truncateAll);

  it("adds an item and normalizes the search fields", async () => {
    const res = await addItem({
      ...baseItem,
      author: "Été",
      title: "Éléphant",
    });
    expect(res.type).toBe("success");

    const rows = await db.select().from(items);
    expect(rows).toHaveLength(1);
    expect(rows[0].nmTitle).toBe("Elephant");
    expect(rows[0].nmAuthor).toBe("Ete");
    expect(rows[0].price).toBe("10.00");
  });

  it("replaces a comma decimal separator in the price", async () => {
    await addItem({ ...baseItem, price: "10,50" });
    const rows = await db.select().from(items);
    expect(rows[0].price).toBe("10.50");
  });

  it("warns when the ISBN already exists", async () => {
    await addItem(baseItem);
    const res = await addItem(baseItem);
    expect(res.type).toBe("warning");
  });
});

describe("searchItems", () => {
  beforeEach(truncateAll);

  it("finds items by title, ignoring case and diacritics", async () => {
    await addItem({ ...baseItem, title: "La Délicatesse" });
    const result = await searchItems({ search: "delicatesse" });
    expect(result.count).toBe(1);
    expect(result.items[0].title).toBe("La Délicatesse");
  });

  it("finds items by ISBN", async () => {
    await addItem({ ...baseItem, isbn: "9781234567890" });
    const result = await searchItems({ search: "9781234567890" });
    expect(result.count).toBe(1);
  });
});

describe("getItem", () => {
  beforeEach(truncateAll);

  it("returns the item with its sales count", async () => {
    await addItem(baseItem);
    const [row] = await db.select().from(items);
    const item = await getItem(row.id);
    expect(item?.title).toBe(baseItem.title);
    expect(item?.count).toBe(0);
  });
});

describe("updateItem", () => {
  beforeEach(truncateAll);

  it("updates and re-normalizes the search fields", async () => {
    await addItem(baseItem);
    const [row] = await db.select().from(items);
    const res = await updateItem(
      { ...baseItem, title: "Nouveau Titre", author: "Nouvel Auteur" },
      row.id,
    );
    expect(res.type).toBe("success");

    const [updated] = await db.select().from(items);
    expect(updated.nmTitle).toBe("Nouveau Titre");
    expect(updated.nmAuthor).toBe("Nouvel Auteur");
  });
});
