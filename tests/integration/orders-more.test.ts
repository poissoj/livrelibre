import {
  getCustomerActiveOrders,
  getItemOrders,
  getOrder,
  getOrders,
  newOrder,
  setCustomerNotified,
} from "@livrelibre/server/server/orders";
import { beforeEach, describe, expect, it } from "vitest";

import { TEST_USER, seedCustomer, seedItem, seedOrder, truncateAll } from "./helpers";

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

    await newOrder({ ...baseOrder, customerId: customer.id, itemId: item.id }, TEST_USER);
    await newOrder({ ...baseOrder, customerId: customer.id, itemId: item.id }, TEST_USER);
    await newOrder(
      {
        ...baseOrder,
        customerId: customer.id,
        itemId: item.id,
        ordered: "done",
      },
      TEST_USER,
    );

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
    await newOrder({ ...baseOrder, customerId: customer.id }, TEST_USER);
    await newOrder({ ...baseOrder, customerId: customer.id, ordered: "done" }, TEST_USER);

    const result = await getCustomerActiveOrders(customer.id);
    expect(result).toHaveLength(1);
    expect(result[0].ordered).toBe("new");
  });
});

describe("setCustomerNotified", () => {
  beforeEach(truncateAll);

  it("updates the customerNotified flag", async () => {
    const customer = await seedCustomer();
    await newOrder({ ...baseOrder, customerId: customer.id }, TEST_USER);
    const { items: orders } = await getOrders({ statuses: ["new"] });

    await setCustomerNotified(orders[0].id, true);

    const order = await getOrder(orders[0].id);
    expect(order?.customerNotified).toBe(true);
  });

  it("throws for an unknown order", async () => {
    await expect(setCustomerNotified(9999, true)).rejects.toThrow();
  });
});

describe("getOrders pagination", () => {
  beforeEach(truncateAll);

  it("paginates flat results and counts all matches", async () => {
    const customer = await seedCustomer();
    for (let i = 0; i < 55; i++) {
      await seedOrder({ customerId: customer.id, itemTitle: `Livre ${String(i)}` });
    }

    const first = await getOrders({ statuses: ["new"], grouped: false });
    expect(first.count).toBe(55);
    expect(first.pageCount).toBe(2);
    expect(first.items).toHaveLength(50);

    const second = await getOrders({ statuses: ["new"], grouped: false, pageNumber: 2 });
    expect(second.items).toHaveLength(5);
  });

  it("keeps a customer group on a single page", async () => {
    const customerA = await seedCustomer({ fullname: "Alice", nmFullname: "alice" });
    const customerB = await seedCustomer({ fullname: "Bob", nmFullname: "bob" });
    await seedOrder({ customerId: customerA.id, itemTitle: "A1" });
    await seedOrder({ customerId: customerA.id, itemTitle: "A2" });
    await seedOrder({ customerId: customerB.id, itemTitle: "B1" });

    const result = await getOrders({ statuses: ["new"] });
    expect(result.count).toBe(3);
    expect(result.pageCount).toBe(1);
    expect(result.items).toHaveLength(3);
  });

  it("pages groups by customer without splitting a group", async () => {
    for (let i = 0; i < 51; i++) {
      const customer = await seedCustomer({
        fullname: `Client ${String(i)}`,
        nmFullname: `client ${String(i)}`,
      });
      await seedOrder({ customerId: customer.id, itemTitle: `Livre ${String(i)}` });
    }

    const first = await getOrders({ statuses: ["new"] });
    expect(first.count).toBe(51);
    expect(first.pageCount).toBe(3);
    expect(first.items).toHaveLength(20);

    const second = await getOrders({ statuses: ["new"], pageNumber: 2 });
    expect(second.items).toHaveLength(20);

    const third = await getOrders({ statuses: ["new"], pageNumber: 3 });
    expect(third.items).toHaveLength(11);
  });

  it("searches on the normalized item title", async () => {
    const customer = await seedCustomer();
    await seedOrder({ customerId: customer.id, itemTitle: "Été" });
    await seedOrder({ customerId: customer.id, itemTitle: "Hiver" });

    const result = await getOrders({ statuses: ["new"], grouped: false, search: "ete" });
    expect(result.count).toBe(1);
    expect(result.items[0].itemTitle).toBe("Été");
  });

  it("searches on the normalized item title with a diacritic search term", async () => {
    const customer = await seedCustomer();
    await seedOrder({ customerId: customer.id, itemTitle: "Les luttes fécondes" });
    await seedOrder({ customerId: customer.id, itemTitle: "Hiver" });

    const result = await getOrders({ statuses: ["new"], grouped: false, search: "féconde" });
    expect(result.count).toBe(1);
    expect(result.items[0].itemTitle).toBe("Les luttes fécondes");
  });

  it("returns no result when no status is selected", async () => {
    const result = await getOrders({ statuses: [] });
    expect(result).toEqual({ items: [], count: 0, pageCount: 0 });
  });
});
