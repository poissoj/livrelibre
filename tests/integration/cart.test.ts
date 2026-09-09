import { beforeEach, describe, expect, it } from "vitest";

import { eq } from "drizzle-orm";

import { db } from "@livrelibre/server/db/database";
import { items, sales } from "@livrelibre/shared/schema";
import {
  addISBNToCart,
  addToCart,
  getCart,
  payCart,
  removeFromCart,
} from "@livrelibre/server/server/cart";
import { CART_ERRORS } from "@livrelibre/shared/errors";
import { seedItem, seedUser, truncateAll } from "./helpers";

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

  it("payCart turns the cart into sales and empties it", async () => {
    const user = await seedUser();
    const item = await seedItem({ amount: 5, price: "10.00" });
    await addToCart(user.id, item.id);

    const res = await payCart(user.id, {
      paymentDate: "2024-01-05",
      paymentType: "cash",
      amount: "10.00",
    });
    expect(res.success).toBe(true);

    const salesRows = await db.select().from(sales);
    expect(salesRows).toHaveLength(1);
    expect(salesRows[0].price).toBe("10.00");
    expect(salesRows[0].deleted).toBe(false);

    const cartData = await getCart(user.id);
    expect(cartData.count).toBe(0);
  });

  it("addISBNToCart returns ITEM_NOT_FOUND for an unknown ISBN", async () => {
    const user = await seedUser();
    const res = await addISBNToCart(user.id, "9781111111111");
    expect(res.errorCode).toBe(CART_ERRORS.ITEM_NOT_FOUND);
  });

  it("addISBNToCart returns NO_STOCK when the item is out of stock", async () => {
    const user = await seedUser();
    await seedItem({ isbn: "9781234567890", amount: 0 });
    const res = await addISBNToCart(user.id, "9781234567890");
    expect(res.errorCode).toBe(CART_ERRORS.NO_STOCK);
  });

  it("removeFromCart restores stock", async () => {
    const user = await seedUser();
    const item = await seedItem({ amount: 5 });
    await addToCart(user.id, item.id);

    const { items: cartItems } = await getCart(user.id);
    await removeFromCart(cartItems[0].id);

    const restored = await db.query.items.findFirst({
      where: eq(items.id, item.id),
    });
    expect(restored?.amount).toBe(5);

    const cartData = await getCart(user.id);
    expect(cartData.count).toBe(0);
  });
});
