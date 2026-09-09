import { beforeEach, describe, expect, it } from "vitest";

import { getStats } from "@livrelibre/server/server/stats";
import { seedSale, truncateAll } from "./helpers";

describe("getStats", () => {
  beforeEach(truncateAll);

  it("groups sales by hour and day of week", async () => {
    await seedSale({ created: new Date("2024-01-05T10:00:00+01:00") });

    const { hours, days } = await getStats();
    expect(hours).toEqual([{ hour: 10, count: 1 }]);
    expect(days).toEqual([{ day: 5, count: 1 }]);
  });

  it("excludes sales outside the 8-21 hour window", async () => {
    await seedSale({ created: new Date("2024-01-05T03:00:00+01:00") });

    const { hours } = await getStats();
    expect(hours).toHaveLength(0);
  });

  it("excludes deleted sales", async () => {
    await seedSale({
      created: new Date("2024-01-05T10:00:00+01:00"),
      deleted: true,
    });

    const { hours, days } = await getStats();
    expect(hours).toHaveLength(0);
    expect(days).toHaveLength(0);
  });
});
