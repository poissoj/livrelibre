import { beforeEach, describe, expect, it } from "vitest";

import {
  deleteOrder,
  getOrder,
  getOrders,
  newOrder,
  setOrder,
} from "@livrelibre/server/server/orders";
import { seedCustomer, truncateAll } from "./helpers";

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

describe("orders", () => {
  beforeEach(truncateAll);

  it("newOrder creates an order and getOrders returns it with the customer", async () => {
    const customer = await seedCustomer();
    const res = await newOrder({ ...baseOrder, customerId: customer.id });
    expect(res.type).toBe("success");

    const orders = await getOrders(["new"]);
    expect(orders).toHaveLength(1);
    expect(orders[0].customerName).toBe(customer.fullname);
    expect(orders[0].itemTitle).toBe("Un livre");
  });

  it("newOrder rejects an unknown customer", async () => {
    const res = await newOrder({ ...baseOrder, customerId: 9999 });
    expect(res.type).toBe("error");
  });

  it("getOrder returns the order with its customer", async () => {
    const customer = await seedCustomer();
    await newOrder({ ...baseOrder, customerId: customer.id });
    const orders = await getOrders(["new"]);

    const order = await getOrder(orders[0].id);
    expect(order?.customer.fullname).toBe(customer.fullname);
  });

  it("getOrder returns null for an unknown id", async () => {
    expect(await getOrder(9999)).toBeNull();
  });

  it("setOrder updates an existing order", async () => {
    const customer = await seedCustomer();
    await newOrder({ ...baseOrder, customerId: customer.id });
    const orders = await getOrders(["new"]);

    const res = await setOrder(
      { ...baseOrder, customerId: customer.id, itemTitle: "Titre modifié" },
      orders[0].id,
    );
    expect(res.type).toBe("success");

    const updated = await getOrder(orders[0].id);
    expect(updated?.itemTitle).toBe("Titre modifié");
  });

  it("deleteOrder removes the order", async () => {
    const customer = await seedCustomer();
    await newOrder({ ...baseOrder, customerId: customer.id });
    const orders = await getOrders(["new"]);

    const res = await deleteOrder(orders[0].id);
    expect(res.type).toBe("success");
    expect(await getOrders(["new"])).toHaveLength(0);
  });
});
