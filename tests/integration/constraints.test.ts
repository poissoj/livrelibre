import { db } from "@livrelibre/server/db/database";
import { asideCart, cart, items, sales } from "@livrelibre/shared/schema";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";

import { seedCustomer, seedItem, seedOrder, seedSale, seedUser, truncateAll } from "./helpers";

describe("check constraints", () => {
  beforeEach(truncateAll);

  it("rejects a negative item amount", async () => {
    await expect(seedItem({ amount: -1 })).rejects.toThrow();
  });

  it("rejects a non-positive sale quantity", async () => {
    await expect(seedSale({ quantity: 0 })).rejects.toThrow();
  });

  it("rejects a non-positive cart quantity", async () => {
    const user = await seedUser();
    await expect(
      db.insert(cart).values({
        type: "book",
        title: "Titre",
        price: "10.00",
        tva: "5.5",
        quantity: 0,
        userId: user.id,
      }),
    ).rejects.toThrow();
  });

  it("rejects a non-positive aside cart quantity", async () => {
    const user = await seedUser();
    await expect(
      db.insert(asideCart).values({
        type: "book",
        title: "Titre",
        price: "10.00",
        tva: "5.5",
        quantity: -1,
        userId: user.id,
      }),
    ).rejects.toThrow();
  });

  it("rejects a non-positive order quantity", async () => {
    const customer = await seedCustomer();
    await expect(seedOrder({ customerId: customer.id, nb: 0 })).rejects.toThrow();
  });
});

describe("negative prices are allowed", () => {
  beforeEach(truncateAll);

  it("accepts a negative item price (bon de réduction)", async () => {
    const item = await seedItem({ price: "-5.00" });
    const rows = await db.select().from(items).where(eq(items.id, item.id));
    expect(rows[0].price).toBe("-5.00");
  });

  it("accepts a negative sale price (ligne de remise)", async () => {
    const sale = await seedSale({ price: "-5.00" });
    const rows = await db.select().from(sales).where(eq(sales.id, sale.id));
    expect(rows[0].price).toBe("-5.00");
  });
});
