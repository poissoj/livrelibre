import { db } from "@livrelibre/server/db/database";
import { addToCart, payCart } from "@livrelibre/server/server/cart";
import { getSales } from "@livrelibre/server/server/sales";
import { deleteSale, getSalesByDay } from "@livrelibre/server/server/salesByDay";
import { searchSales } from "@livrelibre/server/server/searchSale";
import { items, sales } from "@livrelibre/shared/schema";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";

import { TEST_USER, seedItem, seedSale, seedUser, truncateAll } from "./helpers";

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

  it("searchSales filters by title, payment type and date", async () => {
    await seedSale({
      title: "Le Petit Prince",
      paymentType: "cash",
      soldAt: new Date("2024-01-05T10:00:00Z"),
    });
    await seedSale({
      title: "Les Misérables",
      paymentType: "card",
      soldAt: new Date("2024-02-10T10:00:00Z"),
    });

    const byTitle = await searchSales({ title: "petit" });
    expect(byTitle.sales.map((s) => s.title)).toEqual(["Le Petit Prince"]);

    const byPayment = await searchSales({ paymentType: "card" });
    expect(byPayment.sales.map((s) => s.title)).toEqual(["Les Misérables"]);

    const byDate = await searchSales({ dateFrom: "2024-01-01", dateTo: "2024-01-31" });
    expect(byDate.sales.map((s) => s.title)).toEqual(["Le Petit Prince"]);
  });

  it("searchSales excludes deleted sales unless requested", async () => {
    await seedSale({
      title: "Vente supprimée",
      deleted: true,
      soldAt: new Date("2024-01-05T10:00:00Z"),
    });
    await seedSale({
      title: "Vente active",
      deleted: false,
      soldAt: new Date("2024-01-05T11:00:00Z"),
    });

    const without = await searchSales({});
    expect(without.sales.map((s) => s.title)).toEqual(["Vente active"]);

    const withDeleted = await searchSales({ includeDeleted: true });
    expect(withDeleted.sales.map((s) => s.title)).toEqual(["Vente active", "Vente supprimée"]);
  });

  it("searchSales paginates results", async () => {
    await db.insert(sales).values(
      Array.from({ length: 51 }, (_, i) => ({
        itemType: "book",
        price: "10.00",
        quantity: 1,
        title: `Vente pagination ${String(i)}`,
        tva: "5.5" as const,
        linkedToCustomer: false,
        deleted: false,
        paymentType: "cash" as const,
        receiptId: 1,
        soldAt: new Date("2024-01-05T10:00:00Z"),
      })),
    );

    const first = await searchSales({ title: "Vente pagination" });
    expect(first.count).toBe(51);
    expect(first.sales).toHaveLength(50);

    const second = await searchSales({ title: "Vente pagination", pageNumber: 2 });
    expect(second.sales).toHaveLength(1);
  });
});
