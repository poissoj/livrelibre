import { format } from "date-fns";
import { beforeEach, describe, expect, it } from "vitest";

import { lastSales } from "@livrelibre/server/server/lastSales";

import { seedItem, seedSale, truncateAll } from "./helpers";

describe("lastSales", () => {
  beforeEach(truncateAll);

  it("returns 24 months with the current month's count", async () => {
    const item = await seedItem();
    await seedSale({ itemId: item.id, quantity: 3 });

    const result = await lastSales(item.id);
    expect(result).toHaveLength(24);

    const currentMonth = format(new Date(), "yyyy-MM");
    const current = result.find((m) => m.id === currentMonth);
    expect(current?.count).toBe(3);

    const empty = result.filter((m) => m.count === 0);
    expect(empty).toHaveLength(23);
  });
});
