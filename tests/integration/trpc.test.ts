import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it } from "vitest";

import { appRouter } from "@livrelibre/server/router";

import { truncateAll } from "./helpers";

const admin = appRouter.createCaller({
  user: { id: 1, name: "admin", role: "admin" },
});
const guest = appRouter.createCaller({
  user: { id: 2, name: "guest", role: "guest" },
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

  it("allows admin and guest users", async () => {
    const adminResult = await admin.items(1);
    expect(adminResult.items).toBeDefined();

    const guestResult = await guest.items(1);
    expect(guestResult.items).toBeDefined();
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
});
