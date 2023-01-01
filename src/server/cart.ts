import { TRPCError } from "@trpc/server";
import { ObjectId, WithId } from "mongodb";

import { CART_ERRORS } from "@/utils/errors";
import type { DBItem, ItemType, TVA } from "@/utils/item";
import { logger } from "@/utils/logger";
import type { PaymentType } from "@/utils/sale";

import { getDb } from "./database";

type CartItem = {
  itemId?: ObjectId;
  type: ItemType;
  title: string;
  price: string;
  tva: TVA;
  quantity: number;
  username: string;
};

export type NewCartItem = {
  price: string;
  title: string;
  tva: TVA;
  type: ItemType;
};

const sumPrice = (sum: number, item: CartItem) =>
  sum + Number(item.price) * item.quantity * 100;

export const getCart = async (username: string) => {
  const db = await getDb();
  const cartItems = await db
    .collection<CartItem>("cart")
    .find({ username })
    .toArray();

  const total = cartItems.reduce(sumPrice, 0) / 100;
  const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const items = cartItems.map((item) => ({
    ...item,
    itemId: item.itemId?.toString(),
    _id: item._id.toString(),
  }));
  return { items, count, total };
};

export type PaymentFormData = {
  paymentDate: string;
  paymentType: PaymentType;
  amount: string;
};

export const payCart = async (username: string, data: PaymentFormData) => {
  const db = await getDb();
  const cartItems = await db
    .collection<CartItem>("cart")
    .find({ username })
    .toArray();

  if (cartItems.length === 0) {
    throw new Error("No items in cart");
  }
  const cartId = cartItems[0]._id;
  const sales = cartItems.map((item) => ({
    cartId,
    date: data.paymentDate.split("-").reverse().join("/"),
    id: item.itemId,
    itemType: item.type,
    price: Math.round(Number(item.price) * item.quantity * 100) / 100,
    quantity: item.quantity,
    title: item.title,
    tva: item.tva,
    type: data.paymentType,
  }));
  await db.collection("sales").insertMany(sales);
  await db.collection("cart").deleteMany({ username });
  const total = sales.reduce((t, sale) => t + sale.price * 100, 0);
  return {
    success: true,
    change:
      data.paymentType === "cash"
        ? Math.round(Number(data.amount) * 100 - total) / 100
        : null,
  };
};

const addItemToCart = async (
  item: WithId<DBItem>,
  username: string,
  quantity = 1
) => {
  const db = await getDb();
  const cartResult = await db.collection<CartItem>("cart").findOne({
    itemId: item._id,
    username,
  });
  if (cartResult !== null) {
    await db.collection<CartItem>("cart").findOneAndUpdate(
      {
        _id: cartResult._id,
      },
      { $inc: { quantity } }
    );
    return;
  }
  const cartItem: CartItem = {
    itemId: item._id,
    type: item.type,
    title: item.title,
    price: item.price,
    tva: item.tva,
    quantity,
    username,
  };
  await db.collection("cart").insertOne(cartItem);
};

export const addToCart = async (
  username: string,
  itemId: string,
  quantity = 1
) => {
  const db = await getDb();
  const result = await db
    .collection<DBItem>("books")
    .findOneAndUpdate(
      { _id: new ObjectId(itemId), amount: { $gte: quantity } },
      { $inc: { amount: -quantity } }
    );
  if (!result.ok || !result.value) {
    throw new Error("Unable to find item");
  }
  await addItemToCart(result.value, username, quantity);
};

export const addISBNToCart = async (username: string, isbn: string) => {
  const db = await getDb();
  const result = await db
    .collection<DBItem>("books")
    .findOneAndUpdate({ isbn, amount: { $gte: 1 } }, { $inc: { amount: -1 } });
  if (!result.ok) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  }
  if (!result.value) {
    const item = await db.collection<DBItem>("books").findOne({ isbn });
    if (!item) {
      logger.info("ISBN non trouvé", { username, isbn });
      return { errorCode: CART_ERRORS.ITEM_NOT_FOUND };
    }
    logger.info("Plus de stock", { username, isbn });
    return {
      errorCode: CART_ERRORS.NO_STOCK,
      title: item.title,
      id: item._id.toString(),
    };
  }
  await addItemToCart(result.value, username);
  return { errorCode: null };
};

export const addNewItemToCart = async (username: string, item: NewCartItem) => {
  const cartItem: CartItem = {
    ...item,
    title: item.title || "Article indépendant",
    quantity: 1,
    username,
  };
  const db = await getDb();
  await db.collection("cart").insertOne(cartItem);
};

export const removeFromCart = async (cartItemId: string) => {
  const db = await getDb();
  const result = await db
    .collection<CartItem>("cart")
    .findOneAndDelete({ _id: new ObjectId(cartItemId) });
  if (!result.value) {
    return;
  }
  const amount = result.value.quantity || 1;
  const _id = result.value.itemId;
  logger.info("Remove from cart", { cartItemId, itemId: _id });
  if (_id) {
    await db
      .collection<DBItem>("books")
      .updateOne({ _id }, { $inc: { amount } });
  }
};

type CartName = "cart" | "asideCart";

const switchCarts = async (username: string, from: CartName, to: CartName) => {
  logger.info("Switch cart", { from, username });
  const db = await getDb();
  const items = await db
    .collection<CartItem>(from)
    .find({ username })
    .toArray();
  await db.collection<CartItem>(to).insertMany(items);
  await db.collection<CartItem>(from).deleteMany({ username });
};

export const putCartAside = (username: string) =>
  switchCarts(username, "cart", "asideCart");
export const reactivateCart = async (username: string) =>
  switchCarts(username, "asideCart", "cart");

export const getAsideCart = async (username: string) => {
  const db = await getDb();
  const cartItems = await db
    .collection<CartItem>("asideCart")
    .find({ username })
    .toArray();

  const total = cartItems.reduce(sumPrice, 0) / 100;
  const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  return { count, total };
};
