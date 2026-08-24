import { beforeEach, describe, expect, it } from "vitest";

import {
  getCustomerActiveOrders,
  getItemOrders,
  getOrder,
  getOrders,
  newOrder,
  setCustomerNotified,
} from "@/server/orders";
import { seedCustomer, seedItem, truncateAll } from "./helpers";

const baseOrder = {
  created: "2024-01-05",
  itemId: null,
  itemTitle: "Un livre",
  ordered: "new" as const,
  customerNotified: false,
  paid: false,
  comment: "",
  nb: 2,
  contact: "phone" as const,
};

describe("getItemOrders", () => {
  beforeEach(truncateAll);

  it("returns status counts, excluding done orders", async () => {
    const item = await seedItem();
    const customer = await seedCustomer();

    await newOrder({ ...baseOrder, customerId: customer.id, itemId: item.id });
    await newOrder({ ...baseOrder, customerId: customer.id, itemId: item.id });
    await newOrder({
      ...baseOrder,
      customerId: customer.id,
      itemId: item.id,
      ordered: "done",
    });

    const result = await getItemOrders(item.id);
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("new");
    expect(result[0].count).toBe(2);
  });
});

describe("getCustomerActiveOrders", () => {
  beforeEach(truncateAll);

  it("returns only non-done orders", async () => {
    const customer = await seedCustomer();
    await newOrder({ ...baseOrder, customerId: customer.id });
    await newOrder({ ...baseOrder, customerId: customer.id, ordered: "done" });

    const result = await getCustomerActiveOrders(customer.id);
    expect(result).toHaveLength(1);
    expect(result[0].ordered).toBe("new");
  });
});

describe("setCustomerNotified", () => {
  beforeEach(truncateAll);

  it("updates the customerNotified flag", async () => {
    const customer = await seedCustomer();
    await newOrder({ ...baseOrder, customerId: customer.id });
    const orders = await getOrders(["new"]);

    await setCustomerNotified(orders[0].id, true);

    const order = await getOrder(orders[0].id);
    expect(order?.customerNotified).toBe(true);
  });

  it("throws for an unknown order", async () => {
    await expect(setCustomerNotified(9999, true)).rejects.toThrow();
  });
});
