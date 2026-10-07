import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";

import { db } from "@livrelibre/server/db/database";
import { addToCart, payCart } from "@livrelibre/server/server/cart";
import { getSales } from "@livrelibre/server/server/sales";
import {
  deleteSale,
  getSalesByDay,
} from "@livrelibre/server/server/salesByDay";
import { items, sales } from "@livrelibre/shared/schema";

import { TEST_USER, seedItem, seedUser, truncateAll } from "./helpers";

describe("sales", () => {
  beforeEach(truncateAll);

  it("getSalesByDay returns the sales of a day", async () => {
    const user = await seedUser();
    const item = await seedItem({ amount: 5, price: "10.00" });
    await addToCart(user.id, item.id);
    await payCart(user.id, {
      paymentDate: "2024-01-05",
      paymentType: "cash",
    });

    const result = await getSalesByDay("2024-01-05");
    expect(result.salesCount).toBe(1);
    expect(result.total).toBe(10);
    expect(result.carts).toHaveLength(1);
    expect(result.carts[0].total).toBe(10);
  });

  it("getSalesByDay excludes deleted sales from the cart total", async () => {
    const user = await seedUser();
    const item = await seedItem({ amount: 5, price: "10.00" });
    await addToCart(user.id, item.id);
    await payCart(user.id, {
      paymentDate: "2024-01-05",
      paymentType: "cash",
    });

    const [sale] = await db.select().from(sales);
    await deleteSale(sale.id, TEST_USER);

    const result = await getSalesByDay("2024-01-05");
    expect(result.carts[0].total).toBe(0);
  });

  it("getSales aggregates by month", async () => {
    const user = await seedUser();
    const item = await seedItem({ amount: 5, price: "10.00" });
    await addToCart(user.id, item.id);
    await payCart(user.id, {
      paymentDate: "2024-01-05",
      paymentType: "cash",
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
    });

    const [sale] = await db.select().from(sales);
    await deleteSale(sale.id, TEST_USER);

    const [updatedSale] = await db.select().from(sales);
    expect(updatedSale.deleted).toBe(true);

    const restored = await db.query.items.findFirst({
      where: eq(items.id, item.id),
    });
    expect(restored?.amount).toBe(5);
  });

  it("deleteSale does not double-restock when called twice", async () => {
    const user = await seedUser();
    const item = await seedItem({ amount: 5, price: "10.00" });
    await addToCart(user.id, item.id);
    await payCart(user.id, {
      paymentDate: "2024-01-05",
      paymentType: "cash",
    });

    const [sale] = await db.select().from(sales);
    await deleteSale(sale.id, TEST_USER);
    await deleteSale(sale.id, TEST_USER);

    const restored = await db.query.items.findFirst({
      where: eq(items.id, item.id),
    });
    expect(restored?.amount).toBe(5);
  });
});
