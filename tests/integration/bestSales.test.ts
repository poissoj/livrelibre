import { beforeEach, describe, expect, it } from "vitest";

import { db } from "@/db/database";
import { sales } from "@livrelibre/shared/schema";
import { getBestSales } from "@/server/bestSales";
import { addToCart, payCart } from "@/server/cart";
import { deleteSale } from "@/server/salesByDay";
import { seedItem, seedUser, truncateAll } from "./helpers";

describe("bestSales", () => {
  beforeEach(truncateAll);

  it("orders items by total sold quantity", async () => {
    const user = await seedUser();
    const item1 = await seedItem({
      isbn: "9780000000001",
      title: "Best seller",
      amount: 10,
    });
    const item2 = await seedItem({
      isbn: "9780000000002",
      title: "Second",
      amount: 10,
    });

    await addToCart(user.id, item2.id, 1);
    await addToCart(user.id, item1.id, 3);
    await payCart(user.id, {
      paymentDate: "2024-01-05",
      paymentType: "cash",
      amount: "40.00",
    });

    const best = await getBestSales();
    expect(best).toHaveLength(2);
    expect(best[0].id).toBe(item1.id);
    expect(Number(best[0].count)).toBe(3);
    expect(best[1].id).toBe(item2.id);
    expect(Number(best[1].count)).toBe(1);
  });

  it("excludes deleted sales", async () => {
    const user = await seedUser();
    const item = await seedItem({ isbn: "9780000000001", amount: 10 });
    await addToCart(user.id, item.id, 2);
    await payCart(user.id, {
      paymentDate: "2024-01-05",
      paymentType: "cash",
      amount: "20.00",
    });

    const [sale] = await db.select().from(sales);
    await deleteSale(sale.id, sale.itemId);

    const best = await getBestSales();
    expect(best).toHaveLength(0);
  });
});
