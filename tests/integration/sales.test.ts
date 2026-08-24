import { beforeEach, describe, expect, it } from "vitest";

import { eq } from "drizzle-orm";

import { db } from "@/db/database";
import { items, sales } from "@/db/schema";
import { addToCart, payCart } from "@/server/cart";
import { getSales } from "@/server/sales";
import { deleteSale, getSalesByDay } from "@/server/salesByDay";
import { seedItem, seedUser, truncateAll } from "./helpers";

describe("sales", () => {
  beforeEach(truncateAll);

  it("getSalesByDay returns the sales of a day", async () => {
    const user = await seedUser();
    const item = await seedItem({ amount: 5, price: "10.00" });
    await addToCart(user.id, item.id);
    await payCart(user.id, {
      paymentDate: "2024-01-05",
      paymentType: "cash",
      amount: "10.00",
    });

    const result = await getSalesByDay("2024-01-05");
    expect(result.salesCount).toBe(1);
    expect(result.total).toBe(10);
  });

  it("getSales aggregates by month", async () => {
    const user = await seedUser();
    const item = await seedItem({ amount: 5, price: "10.00" });
    await addToCart(user.id, item.id);
    await payCart(user.id, {
      paymentDate: "2024-01-05",
      paymentType: "cash",
      amount: "10.00",
    });

    const months = await getSales();
    expect(months).toHaveLength(1);
    expect(months[0].month).toBe("01/2024");
    expect(months[0].count).toBe(1);
  });

  it("deleteSale soft-deletes the sale and restores stock", async () => {
    const user = await seedUser();
    const item = await seedItem({ amount: 5, price: "10.00" });
    await addToCart(user.id, item.id);
    await payCart(user.id, {
      paymentDate: "2024-01-05",
      paymentType: "cash",
      amount: "10.00",
    });

    const [sale] = await db.select().from(sales);
    await deleteSale(sale.id, sale.itemId);

    const [updatedSale] = await db.select().from(sales);
    expect(updatedSale.deleted).toBe(true);

    const restored = await db.query.items.findFirst({
      where: eq(items.id, item.id),
    });
    expect(restored?.amount).toBe(5);
  });
});
