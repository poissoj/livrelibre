import { resolveSale } from "@server/server/sales/resolveSale";
import type { DbSale, SaleItem } from "@server/server/sales/types";
import { describe, expect, it } from "vitest";

const makeSaleItem = (overrides: Partial<SaleItem> = {}): SaleItem => ({
  author: "Antoine de Saint-Exupéry",
  title: "Le Petit Prince",
  amount: 5,
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
    const result = resolveSale(makeDbSale(), makeSaleItem());

    expect(result.itemId).toBe(1);
    expect(result.price).toBe(8.9);
    expect(result.quantity).toBe(1);
    expect("amount" in result ? result.amount : undefined).toBe(5);
    expect("author" in result ? result.author : undefined).toBe("Antoine de Saint-Exupéry");
  });

  it("degrades to an unlisted sale when the item is missing", () => {
    const result = resolveSale(makeDbSale({ itemId: 42, title: "Vente orpheline" }), undefined);

    expect(result.itemId).toBeNull();
    expect(result.title).toBe("Vente orpheline");
    expect(result.price).toBe(8.9);
    expect("amount" in result).toBe(false);
  });

  it("keeps standalone sales (no itemId) as unlisted", () => {
    const result = resolveSale(
      makeDbSale({ itemId: null, title: "Article indépendant" }),
      undefined,
    );

    expect(result.itemId).toBeNull();
    expect(result.title).toBe("Article indépendant");
    expect("amount" in result).toBe(false);
  });
});
