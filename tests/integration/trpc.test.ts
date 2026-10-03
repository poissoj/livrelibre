import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it } from "vitest";

import { appRouter } from "@livrelibre/server/router";

import { seedSale, truncateAll } from "./helpers";

const admin = appRouter.createCaller({
  user: { id: 1, name: "admin", role: "admin" },
});
const cashier = appRouter.createCaller({
  user: { id: 2, name: "cashier", role: "cashier" },
});
const anonymous = appRouter.createCaller({
  user: { id: 0, name: "", role: "anonymous" },
});

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

describe("trpc auth", () => {
  it("allows the unauthenticated user query", async () => {
    const user = await anonymous.user();
    expect(user.role).toBe("anonymous");
  });

  it("rejects anonymous users on protected procedures", async () => {
    await expect(anonymous.items(1)).rejects.toBeInstanceOf(TRPCError);
  });

  it("allows admin and cashier users", async () => {
    const adminResult = await admin.items(1);
    expect(adminResult.items).toBeDefined();

    const cashierResult = await cashier.items(1);
    expect(cashierResult.items).toBeDefined();
  });
});

describe("trpc input validation", () => {
  it("rejects a non-number for the items procedure", async () => {
    await expect(admin.items("abc" as unknown as number)).rejects.toThrow();
  });

  it("rejects an ISBN that is too short", async () => {
    await expect(admin.isbnSearch("123")).rejects.toThrow();
  });
});

describe("trpc round-trip", () => {
  beforeEach(truncateAll);

  it("adds an item and finds it via quicksearch", async () => {
    const res = await admin.addItem({ ...baseItem, title: "Éléphant" });
    expect(res.type).toBe("success");

    const found = await admin.quicksearch({ search: "elephant" });
    expect(found.count).toBe(1);
    expect(found.items[0].title).toBe("Éléphant");
  });

  it("truncates an over-long scanned ISBN to 13 digits", async () => {
    await admin.addItem({ ...baseItem, isbn: "9780000000001" });

    const found = await admin.isbnSearch("9780000000001234");
    expect(found.count).toBe(1);
    expect(found.items[0].isbn).toBe("9780000000001");
  });
});

describe("trpc rbac", () => {
  beforeEach(truncateAll);

  it("rejects cashiers on admin-only procedures", async () => {
    await expect(cashier.sales()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      cashier.salesByMonth({ month: "01", year: "2024" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows admins on admin-only procedures", async () => {
    await expect(admin.sales()).resolves.toBeDefined();
    await expect(
      admin.salesByMonth({ month: "01", year: "2024" }),
    ).resolves.toBeDefined();
  });

  it("restricts cashiers to the sales of the current day", async () => {
    await seedSale({
      created: new Date("2024-01-05T12:00:00Z"),
      quantity: 2,
    });
    await seedSale({ created: new Date(), quantity: 1 });

    const cashierResult = await cashier.salesByDay("2024-01-05");
    expect(cashierResult.salesCount).toBe(1);

    const adminResult = await admin.salesByDay("2024-01-05");
    expect(adminResult.salesCount).toBe(2);
  });

  it("lets a cashier delete a sale of the day but not an older one", async () => {
    const todaySale = await seedSale({ created: new Date() });
    await expect(
      cashier.deleteSale({ saleId: todaySale.id }),
    ).resolves.toBeUndefined();

    const oldSale = await seedSale({
      created: new Date("2024-01-05T12:00:00Z"),
    });
    await expect(
      cashier.deleteSale({ saleId: oldSale.id }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("lets an admin delete an older sale", async () => {
    const oldSale = await seedSale({
      created: new Date("2024-01-05T12:00:00Z"),
    });
    await expect(
      admin.deleteSale({ saleId: oldSale.id }),
    ).resolves.toBeUndefined();
  });

  it("rejects anonymous on deleteSale", async () => {
    const sale = await seedSale({ created: new Date() });
    await expect(
      anonymous.deleteSale({ saleId: sale.id }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
