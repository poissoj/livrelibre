import type { Item } from "@livrelibre/shared/item";
import { resolveSale } from "@server/server/sales/resolveSale";
import type { DbSale } from "@server/server/sales/types";
import { describe, expect, it } from "vitest";

const makeItem = (overrides: Partial<Item> = {}): Item => ({
  id: 1,
  type: "book",
  isbn: "9782070413119",
  author: "Antoine de Saint-Exupéry",
  title: "Le Petit Prince",
  publisher: "Gallimard",
  distributor: "Gallimard",
  keywords: null,
  datebought: "2024-01-15",
  comments: null,
  price: "8.90",
  amount: 5,
  tva: "5.5",
  starred: false,
  nmAuthor: "antoine de saint-exupery",
  nmTitle: "le petit prince",
  nmPublisher: "gallimard",
  nmDistributor: "gallimard",
  ...overrides,
});

const makeDbSale = (overrides: Partial<DbSale> = {}): DbSale => ({
  id: 1,
  itemId: 1,
  receiptId: 1,
  price: 8.9,
  title: "Le Petit Prince",
  tva: "5.5",
  paymentType: "cash",
  quantity: 1,
  deleted: false,
  linkedToCustomer: false,
  ...overrides,
});

describe("resolveSale", () => {
  it("returns a full item sale when the item exists", () => {
    const result = resolveSale(makeDbSale(), new Map([[1, makeItem()]]));

    expect(result.itemId).toBe(1);
    expect(result.price).toBe(8.9);
    expect(result.quantity).toBe(1);
    expect("amount" in result ? result.amount : undefined).toBe(5);
    expect("author" in result ? result.author : undefined).toBe("Antoine de Saint-Exupéry");
  });

  it("degrades to an unlisted sale when the item is missing", () => {
    const result = resolveSale(makeDbSale({ itemId: 42, title: "Vente orpheline" }), new Map());

    expect(result.itemId).toBeNull();
    expect(result.title).toBe("Vente orpheline");
    expect(result.price).toBe(8.9);
    expect("amount" in result).toBe(false);
  });

  it("keeps standalone sales (no itemId) as unlisted", () => {
    const result = resolveSale(
      makeDbSale({ itemId: null, title: "Article indépendant" }),
      new Map(),
    );

    expect(result.itemId).toBeNull();
    expect(result.title).toBe("Article indépendant");
    expect("amount" in result).toBe(false);
  });
});
