import {
  addNewItemToCart,
  addToCart,
  getAsideCart,
  getCart,
  putCartAside,
  reactivateCart,
} from "@livrelibre/server/server/cart";
import { beforeEach, describe, expect, it } from "vitest";

import { seedItem, seedUser, truncateAll } from "./helpers";

describe("aside cart", () => {
  beforeEach(truncateAll);

  it("addNewItemToCart adds an independent item without touching stock", async () => {
    const user = await seedUser();
    await addNewItemToCart(user.id, {
      price: "7.50",
      title: "Article indépendant",
      tva: "20",
      type: "book",
    });

    const cartData = await getCart(user.id);
    expect(cartData.count).toBe(1);
    expect(cartData.items[0].title).toBe("Article indépendant");
    expect(cartData.items[0].itemId).toBeNull();
  });

  it("putCartAside moves the cart into the aside cart", async () => {
    const user = await seedUser();
    const item = await seedItem({ amount: 5 });
    await addToCart(user.id, item.id);

    await putCartAside(user.id);

    expect((await getCart(user.id)).count).toBe(0);
    const aside = await getAsideCart(user.id);
    expect(aside.count).toBe(1);
    expect(aside.total).toBe(10);
  });

  it("reactivateCart moves the aside cart back into the cart", async () => {
    const user = await seedUser();
    const item = await seedItem({ amount: 5 });
    await addToCart(user.id, item.id);
    await putCartAside(user.id);

    await reactivateCart(user.id);

    expect((await getCart(user.id)).count).toBe(1);
    expect((await getAsideCart(user.id)).count).toBe(0);
  });

  it("does not lose an item added while the cart is put aside", async () => {
    const user = await seedUser();
    const itemA = await seedItem({ isbn: "9780000000001", amount: 5 });
    const itemB = await seedItem({ isbn: "9780000000002", amount: 5 });
    await addToCart(user.id, itemA.id);

    await Promise.allSettled([putCartAside(user.id), addToCart(user.id, itemB.id)]);

    const cartData = await getCart(user.id);
    const asideData = await getAsideCart(user.id);
    expect(cartData.count + asideData.count).toBe(2);
  });

  it("getAsideCart returns zero for an empty aside cart", async () => {
    const user = await seedUser();
    const aside = await getAsideCart(user.id);
    expect(aside.count).toBe(0);
    expect(aside.total).toBe(0);
  });
});
