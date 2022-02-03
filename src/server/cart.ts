import type { DBItem, ItemType, TVA } from "@/utils/item";
import type { PaymentType } from "@/utils/sale";
import { ObjectId } from "mongodb";
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

export const addToCart = async (username: string, itemId: string) => {
  const db = await getDb();
  const result = await db
    .collection<DBItem>("books")
    .findOneAndUpdate(
      { _id: new ObjectId(itemId), amount: { $gt: 0 } },
      { $inc: { amount: -1 } }
    );
  if (!result.ok || !result.value) {
    throw new Error("Unable to find item");
  }
  const item = result.value;
  const cartItem = {
    itemId: item._id,
    type: item.type,
    title: item.title,
    price: item.price,
    tva: item.tva,
    quantity: 1,
    username,
  };
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
  await db.collection<DBItem>("books").updateOne({ _id }, { $inc: { amount } });
};
