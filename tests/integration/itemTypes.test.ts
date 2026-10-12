import { appRouter } from "@livrelibre/server/router";
import { getBookItemTypeCode, getDefaultItemTypeCode } from "@server/server/itemTypes";
import { beforeEach, describe, expect, it } from "vitest";

import { truncateAll } from "./helpers";

const admin = appRouter.createCaller({ user: { id: 1, name: "admin", role: "admin" } });
const cashier = appRouter.createCaller({ user: { id: 2, name: "cashier", role: "cashier" } });

const baseItem = {
  type: "book",
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

describe("itemTypes", () => {
  beforeEach(truncateAll);

  it("lists the seeded types ordered by position", async () => {
    const types = await admin.itemTypes();
    expect(types).toHaveLength(9);
    expect(types.map((type) => type.code)).toEqual([
      "postcard",
      "stationery",
      "game",
      "book",
      "magazine",
      "unknown",
      "dvd",
      "deposit",
      "discount",
    ]);
  });

  it("uses book for imports and keeps the discount type hidden", async () => {
    expect(await getBookItemTypeCode()).toBe("book");
    const types = await admin.itemTypes();
    expect(types.find((type) => type.code === "discount")?.active).toBe(false);
  });

  it("allows admins to create and rename a type", async () => {
    await admin.createItemType({ code: "cd", label: "CD" });
    let types = await admin.itemTypes();
    expect(types.find((type) => type.code === "cd")?.label).toBe("CD");

    await admin.updateItemType({ code: "cd", label: "CD audio" });
    types = await admin.itemTypes();
    expect(types.find((type) => type.code === "cd")?.label).toBe("CD audio");
  });

  it("rejects a duplicate code", async () => {
    await expect(admin.createItemType({ code: "book", label: "Livre" })).rejects.toMatchObject({
      code: "CONFLICT",
    });
  });

  it("keeps a single default type", async () => {
    await admin.createItemType({ code: "cd", label: "CD", isDefault: true });
    const types = await admin.itemTypes();
    expect(types.filter((type) => type.isDefault).map((type) => type.code)).toEqual(["cd"]);
    expect(await getDefaultItemTypeCode()).toBe("cd");
  });

  it("deletes an unused type", async () => {
    await admin.createItemType({ code: "cd", label: "CD" });
    await admin.deleteItemType("cd");
    const types = await admin.itemTypes();
    expect(types.some((type) => type.code === "cd")).toBe(false);
  });

  it("refuses to delete a type used by an item", async () => {
    await admin.createItemType({ code: "cd", label: "CD" });
    await admin.addItem({ ...baseItem, type: "cd" });

    await expect(admin.deleteItemType("cd")).rejects.toMatchObject({ code: "BAD_REQUEST" });
    const types = await admin.itemTypes();
    expect(types.some((type) => type.code === "cd")).toBe(true);
  });

  it("rejects an item with an unknown type", async () => {
    await expect(admin.addItem({ ...baseItem, type: "nope" })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("restricts type management to admins", async () => {
    await expect(cashier.createItemType({ code: "cd", label: "CD" })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    await expect(cashier.deleteItemType("book")).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
