import { describe, expect, it } from "vitest";

import { deserializeOrder } from "@/utils/order";

const validOrder = {
  created: "2024-01-05",
  customerId: 1,
  itemId: 5,
  itemTitle: "Mon livre",
  ordered: "new",
  customerNotified: false,
  paid: false,
  comment: "",
  nb: 2,
  contact: "phone",
};

describe("deserializeOrder", () => {
  it("converts the created string into a Date", () => {
    const result = deserializeOrder(validOrder);
    expect(result.created).toBeInstanceOf(Date);
    expect(result.created.toISOString()).toBe("2024-01-05T00:00:00.000Z");
  });

  it("keeps the other fields unchanged", () => {
    const result = deserializeOrder(validOrder);
    expect(result.customerId).toBe(1);
    expect(result.itemTitle).toBe("Mon livre");
    expect(result.nb).toBe(2);
  });
});
