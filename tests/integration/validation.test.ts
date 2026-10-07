import { beforeEach, describe, expect, it } from "vitest";

import { appRouter } from "@livrelibre/server/router";

import { seedUser, truncateAll } from "./helpers";

const caller = appRouter.createCaller({
  user: { id: 1, name: "admin", role: "admin" },
});

const BAD_REQUEST = { code: "BAD_REQUEST" };

const baseItem = {
  type: "book" as const,
  isbn: "9780000000001",
  author: "Auteur",
  title: "Un Titre",
  publisher: "Éditeur",
  distributor: "Distributeur",
  keywords: null,
  datebought: "2024-01-01",
  comments: null,
  price: "10.00",
  amount: 5,
  tva: "5.5" as const,
};

const baseOrder = {
  created: "2024-01-05",
  customerId: 1,
  itemId: null,
  itemTitle: "Un livre",
  ordered: "new" as const,
  customerNotified: false,
  paid: false,
  comment: "",
  nb: 1,
  contact: "phone" as const,
};

describe("input validation", () => {
  beforeEach(truncateAll);

  it("rejects a non-positive or non-integer quantity", async () => {
    await expect(
      caller.addToCart({ id: 1, quantity: -1 }),
    ).rejects.toMatchObject(BAD_REQUEST);
    await expect(
      caller.addToCart({ id: 1, quantity: 0 }),
    ).rejects.toMatchObject(BAD_REQUEST);
    await expect(
      caller.addToCart({ id: 1, quantity: 1.5 }),
    ).rejects.toMatchObject(BAD_REQUEST);
  });

  it("rejects an invalid page number", async () => {
    await expect(caller.items(0)).rejects.toMatchObject(BAD_REQUEST);
    await expect(caller.items(-1)).rejects.toMatchObject(BAD_REQUEST);
    await expect(
      caller.quicksearch({ search: "a", page: 0, inStock: false }),
    ).rejects.toMatchObject(BAD_REQUEST);
  });

  it("rejects an invalid date", async () => {
    await expect(caller.salesByDay("2024-99-99")).rejects.toMatchObject(
      BAD_REQUEST,
    );
    await expect(caller.salesByDay("not-a-date")).rejects.toMatchObject(
      BAD_REQUEST,
    );
  });

  it("rejects an invalid item price", async () => {
    await expect(
      caller.addItem({ ...baseItem, price: "abc" }),
    ).rejects.toMatchObject(BAD_REQUEST);
    await expect(
      caller.addItem({ ...baseItem, price: "1.234" }),
    ).rejects.toMatchObject(BAD_REQUEST);
  });

  it("accepts a negative price (deposits)", async () => {
    await expect(
      caller.addItem({ ...baseItem, price: "-5.00" }),
    ).resolves.toBeDefined();
  });

  it("accepts a negative price for a standalone cart item (loyalty discount)", async () => {
    const user = await seedUser();
    const userCaller = appRouter.createCaller({
      user: { id: user.id, name: user.name, role: "cashier" },
    });

    await expect(
      userCaller.addNewItemToCart({
        price: "-3.00",
        title: "Remise carte de fidélité",
        tva: "5.5",
        type: "book",
      }),
    ).resolves.toBeUndefined();
  });

  it("rejects a non-ISO item date", async () => {
    await expect(
      caller.addItem({ ...baseItem, datebought: "01/01/2024" }),
    ).rejects.toMatchObject(BAD_REQUEST);
  });

  it("rejects a negative or decimal amount", async () => {
    await expect(
      caller.addItem({ ...baseItem, amount: -1 }),
    ).rejects.toMatchObject(BAD_REQUEST);
    await expect(
      caller.addItem({ ...baseItem, amount: 1.5 }),
    ).rejects.toMatchObject(BAD_REQUEST);
  });

  it("rejects invalid order values", async () => {
    await expect(
      caller.newOrder({ ...baseOrder, created: "nope" }),
    ).rejects.toMatchObject(BAD_REQUEST);
    await expect(
      caller.newOrder({ ...baseOrder, nb: 1.5 }),
    ).rejects.toMatchObject(BAD_REQUEST);
  });

  it("rejects a non-numeric advanced search price", async () => {
    await expect(
      caller.advancedSearch({ search: { price: "abc" }, page: 1 }),
    ).rejects.toMatchObject(BAD_REQUEST);
  });

  it("rejects an unknown selected customer", async () => {
    await expect(
      caller.selectCustomer({ customerId: 999999, asideCart: false }),
    ).rejects.toMatchObject(BAD_REQUEST);
  });
});
