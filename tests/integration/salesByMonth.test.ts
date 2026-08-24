import { beforeEach, describe, expect, it } from "vitest";

import { addToCart, payCart } from "@/server/cart";
import { getSalesByMonth } from "@/server/salesByMonth";
import { seedItem, seedUser, truncateAll } from "./helpers";

describe("getSalesByMonth", () => {
  beforeEach(truncateAll);

  it("returns sales, stats and item types for a month", async () => {
    const user = await seedUser();
    const item = await seedItem({ amount: 5, price: "10.00" });
    await addToCart(user.id, item.id);
    await payCart(user.id, {
      paymentDate: "2024-01-05",
      paymentType: "cash",
      amount: "10.00",
    });

    const { salesByDay, stats, itemTypes } = await getSalesByMonth(
      "01",
      "2024",
    );

    expect(salesByDay).toHaveLength(1);
    expect(salesByDay[0].date).toBe("2024-01-05");
    expect(salesByDay[0].count).toBe(1);

    expect(stats).toHaveLength(1);
    expect(stats[0].tva).toBe("5.5");
    expect(stats[0].paymentType).toBe("cash");

    expect(itemTypes).toHaveLength(1);
    expect(itemTypes[0].itemType).toBe("book");
    expect(itemTypes[0].nb).toBe(1);
  });

  it("returns empty results for a month without sales", async () => {
    const { salesByDay, stats, itemTypes } = await getSalesByMonth("02", "2024");
    expect(salesByDay).toHaveLength(0);
    expect(stats).toHaveLength(0);
    expect(itemTypes).toHaveLength(0);
  });
});
