import { db } from "@livrelibre/server/db/database";
import { getSettings, updateSettings } from "@livrelibre/server/server/settings";
import { settings } from "@livrelibre/shared/schema";
import { zSettings } from "@livrelibre/shared/settings";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";

import { truncateAll } from "./helpers";

describe("settings", () => {
  beforeEach(truncateAll);

  it("returns the default loyalty discount percent", async () => {
    const current = await getSettings();
    expect(current.loyaltyDiscountPercent).toBe(3);
  });

  it("updates the loyalty discount percent", async () => {
    const updated = await updateSettings({ loyaltyDiscountPercent: 5.5 });
    expect(updated.loyaltyDiscountPercent).toBe(5.5);

    expect(await getSettings()).toEqual({ loyaltyDiscountPercent: 5.5 });
  });

  it("recreates the settings row when missing", async () => {
    await db.delete(settings).where(eq(settings.id, 1));
    const current = await getSettings();
    expect(current.loyaltyDiscountPercent).toBe(3);

    const rows = await db.select().from(settings);
    expect(rows).toHaveLength(1);
  });

  it("rejects a percent out of bounds", () => {
    expect(zSettings.safeParse({ loyaltyDiscountPercent: -1 }).success).toBe(false);
    expect(zSettings.safeParse({ loyaltyDiscountPercent: 101 }).success).toBe(false);
    expect(zSettings.safeParse({ loyaltyDiscountPercent: 3 }).success).toBe(true);
  });
});
