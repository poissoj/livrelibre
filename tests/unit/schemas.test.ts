import { zCustomer } from "@livrelibre/shared/customer";
import { zItem } from "@livrelibre/shared/item";
import { zOrder } from "@livrelibre/shared/order";
import { describe, expect, it } from "vitest";

const validItem = {
  type: "book",
  isbn: "9780000000001",
  author: "Auteur",
  title: "Titre",
  publisher: "Éditeur",
  distributor: "Distributeur",
  keywords: null,
  datebought: "2024-01-01",
  comments: null,
  price: "10.00",
  amount: 5,
  tva: "5.5",
} as const;

const validOrder = {
  created: "2024-01-05T10:00:00.000Z",
  customerId: 1,
  itemId: null,
  itemTitle: "Un titre",
  ordered: "new",
  customerNotified: false,
  paid: false,
  comment: "",
  nb: 1,
  contact: "unknown",
} as const;

const validCustomer = {
  fullname: "Ada Lovelace",
  phone: null,
  email: null,
  contact: "",
  comment: "",
} as const;

describe("zItem", () => {
  it("accepts a valid item and normalizes a comma price", () => {
    const parsed = zItem.parse({ ...validItem, price: "12,50" });
    expect(parsed.price).toBe("12.50");
  });

  it("rejects invalid prices", () => {
    expect(zItem.safeParse({ ...validItem, price: "abc" }).success).toBe(false);
    expect(zItem.safeParse({ ...validItem, price: "1.234" }).success).toBe(false);
  });

  it("rejects a negative or decimal amount", () => {
    expect(zItem.safeParse({ ...validItem, amount: -1 }).success).toBe(false);
    expect(zItem.safeParse({ ...validItem, amount: 1.5 }).success).toBe(false);
  });

  it("rejects an invalid date or TVA", () => {
    expect(zItem.safeParse({ ...validItem, datebought: "01/01/2024" }).success).toBe(false);
    expect(zItem.safeParse({ ...validItem, tva: "12" }).success).toBe(false);
  });
});

describe("zOrder", () => {
  it("accepts a valid order", () => {
    expect(zOrder.safeParse(validOrder).success).toBe(true);
  });

  it("rejects an invalid date and a non-positive nb", () => {
    expect(zOrder.safeParse({ ...validOrder, created: "nope" }).success).toBe(false);
    expect(zOrder.safeParse({ ...validOrder, nb: 0 }).success).toBe(false);
    expect(zOrder.safeParse({ ...validOrder, nb: 1.5 }).success).toBe(false);
  });

  it("rejects an unknown contact mean", () => {
    expect(zOrder.safeParse({ ...validOrder, contact: "carrier-pigeon" }).success).toBe(false);
  });
});

describe("zCustomer", () => {
  it("accepts a valid customer", () => {
    expect(zCustomer.safeParse(validCustomer).success).toBe(true);
  });

  it("requires a non-empty fullname", () => {
    expect(zCustomer.safeParse({ ...validCustomer, fullname: "  " }).success).toBe(false);
  });
});
