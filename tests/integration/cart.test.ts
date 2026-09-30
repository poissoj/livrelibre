import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";

import { db } from "@livrelibre/server/db/database";
import {
  addISBNToCart,
  addNewItemToCart,
  addToCart,
  getCart,
  payCart,
  removeFromCart,
} from "@livrelibre/server/server/cart";
import {
  addPurchase,
  setSelectedCustomer,
} from "@livrelibre/server/server/customers";
import { items, purchases, sales } from "@livrelibre/shared/schema";

import { seedCustomer, seedItem, seedUser, truncateAll } from "./helpers";

describe("cart", () => {
  beforeEach(truncateAll);

  it("addToCart decrements stock and adds the item", async () => {
    const user = await seedUser();
    const item = await seedItem({ amount: 5 });

    await addToCart(user.id, item.id);

    const updated = await db.query.items.findFirst({
      where: eq(items.id, item.id),
    });
    expect(updated?.amount).toBe(4);

    const cartData = await getCart(user.id);
    expect(cartData.count).toBe(1);
    expect(cartData.total).toBe(10);
  });

  it("merges concurrent adds into a single cart line", async () => {
    const user = await seedUser();
    const item = await seedItem({ amount: 5, price: "10.00" });

    await Promise.all([
      addToCart(user.id, item.id),
      addToCart(user.id, item.id),
    ]);

    const cartData = await getCart(user.id);
    expect(cartData.items).toHaveLength(1);
    expect(cartData.count).toBe(2);

    const updated = await db.query.items.findFirst({
      where: eq(items.id, item.id),
    });
    expect(updated?.amount).toBe(3);
  });

  it("addToCart rejects when stock is insufficient", async () => {
    const user = await seedUser();
    const item = await seedItem({ amount: 1 });

    await addToCart(user.id, item.id);

    await expect(addToCart(user.id, item.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("payCart rejects an empty cart", async () => {
    const user = await seedUser();

    await expect(
      payCart(user.id, {
        paymentDate: "2024-01-05",
        paymentType: "cash",
      }),
    ).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });

  it("payCart turns the cart into sales and empties it", async () => {
    const user = await seedUser();
    const item = await seedItem({ amount: 5, price: "10.00" });
    await addToCart(user.id, item.id);

    const res = await payCart(user.id, {
      paymentDate: "2024-01-05",
      paymentType: "cash",
    });
    expect(res.success).toBe(true);

    const salesRows = await db.select().from(sales);
    expect(salesRows).toHaveLength(1);
    expect(salesRows[0].price).toBe("10.00");
    expect(salesRows[0].deleted).toBe(false);

    const cartData = await getCart(user.id);
    expect(cartData.count).toBe(0);
  });

  it("payCart cannot sell the same cart twice concurrently", async () => {
    const user = await seedUser();
    const item = await seedItem({ amount: 5, price: "10.00" });
    await addToCart(user.id, item.id);

    const attempt = () =>
      payCart(user.id, {
        paymentDate: "2024-01-05",
        paymentType: "cash",
      });
    const results = await Promise.allSettled([attempt(), attempt()]);

    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((r) => r.status === "rejected")).toHaveLength(1);

    const salesRows = await db.select().from(sales);
    expect(salesRows).toHaveLength(1);

    const cartData = await getCart(user.id);
    expect(cartData.count).toBe(0);
  });

  it("resets the customer purchases when paying a loyalty discount", async () => {
    const user = await seedUser();
    const customer = await seedCustomer();
    await addPurchase(customer.id, 10);
    await setSelectedCustomer({
      asideCart: false,
      userId: user.id,
      customerId: customer.id,
    });
    await addNewItemToCart(user.id, {
      price: "-3.00",
      title: "Remise carte de fidélité",
      tva: "5.5",
      type: "book",
    });

    await payCart(user.id, {
      paymentDate: "2024-01-05",
      paymentType: "cash",
    });

    const remaining = await db
      .select()
      .from(purchases)
      .where(eq(purchases.customerId, customer.id));
    expect(remaining).toHaveLength(0);
    const cartData = await getCart(user.id);
    expect(cartData.count).toBe(0);
  });

  it("records a purchase for the selected customer", async () => {
    const user = await seedUser();
    const customer = await seedCustomer();
    await setSelectedCustomer({
      asideCart: false,
      userId: user.id,
      customerId: customer.id,
    });
    const item = await seedItem({ amount: 5, price: "10.00" });
    await addToCart(user.id, item.id);

    await payCart(user.id, {
      paymentDate: "2024-01-05",
      paymentType: "cash",
    });

    const rows = await db
      .select()
      .from(purchases)
      .where(eq(purchases.customerId, customer.id));
    expect(rows).toHaveLength(1);
    expect(rows[0].amount).toBe("10.00");

    const salesRows = await db.select().from(sales);
    expect(salesRows[0].linkedToCustomer).toBe(true);
  });

  it("addISBNToCart returns ITEM_NOT_FOUND for an unknown ISBN", async () => {
    const user = await seedUser();
    const res = await addISBNToCart(user.id, "9781111111111");
    expect(res.errorCode).toBe("ITEM_NOT_FOUND");
  });

  it("addISBNToCart returns NO_STOCK when the item is out of stock", async () => {
    const user = await seedUser();
    await seedItem({ isbn: "9781234567890", amount: 0 });
    const res = await addISBNToCart(user.id, "9781234567890");
    expect(res.errorCode).toBe("NO_STOCK");
  });

  it("removeFromCart restores stock", async () => {
    const user = await seedUser();
    const item = await seedItem({ amount: 5 });
    await addToCart(user.id, item.id);

    const { items: cartItems } = await getCart(user.id);
    await removeFromCart(user.id, cartItems[0].id);

    const restored = await db.query.items.findFirst({
      where: eq(items.id, item.id),
    });
    expect(restored?.amount).toBe(5);

    const cartData = await getCart(user.id);
    expect(cartData.count).toBe(0);
  });

  it("removeFromCart cannot delete another user's cart line", async () => {
    const userA = await seedUser();
    const userB = await seedUser({ name: "cashier", role: "cashier" });
    const item = await seedItem({ amount: 5 });
    await addToCart(userA.id, item.id);
    await addToCart(userB.id, item.id);

    const { items: cartA } = await getCart(userA.id);
    await removeFromCart(userB.id, cartA[0].id);

    const cartAData = await getCart(userA.id);
    expect(cartAData.count).toBe(1);
    const cartBData = await getCart(userB.id);
    expect(cartBData.count).toBe(1);

    const unchanged = await db.query.items.findFirst({
      where: eq(items.id, item.id),
    });
    expect(unchanged?.amount).toBe(3);
  });
});
