import { and, eq, isNotNull, sql } from "drizzle-orm";

import { db } from "@/db/database";
import {
  type Item,
  asideCart,
  cart,
  items as itemsTable,
  sales,
  selectedCustomer as selectedCustomerTable,
} from "@/db/schema";
import {
  addPurchase,
  getSelectedCustomer,
  resetCustomer,
  setSelectedCustomer,
} from "@/server/customers";
import { CART_ERRORS } from "@/utils/errors";
import type { ItemType, TVA } from "@/utils/item";
import { logger } from "@/utils/logger";
import type { PaymentType } from "@/utils/sale";

type CartItem = {
  itemId?: number | null;
  type: ItemType;
  title: string;
  price: string;
  tva: TVA;
  quantity: number;
  userId: number;
};

export type NewCartItem = {
  price: string;
  title: string;
  tva: TVA;
  type: ItemType;
};

const sumPrice = (sum: number, item: CartItem) =>
  sum + Number(item.price) * item.quantity * 100;

export const getCart = async (userId: number) => {
  const cartItems = await db.select().from(cart).where(eq(cart.userId, userId));

  const total = cartItems.reduce(sumPrice, 0) / 100;
  const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  return { items: cartItems, count, total };
};

export type PaymentFormData = {
  paymentDate: string;
  paymentType: PaymentType;
  amount: string;
};

export const payCart = async (userId: number, data: PaymentFormData) => {
  const cartItems = await db.select().from(cart).where(eq(cart.userId, userId));

  if (cartItems.length === 0) {
    throw new Error("No items in cart");
  }
  const cartId = cartItems[0].id;
  const customer = await getSelectedCustomer(userId, false);
  const salesList: (typeof sales.$inferInsert)[] = cartItems.map((item) => ({
    cartId,
    created: new Date(data.paymentDate),
    itemId: item.itemId,
    itemType: item.type,
    price: String(Math.round(Number(item.price) * item.quantity * 100) / 100),
    quantity: item.quantity,
    title: item.title,
    tva: item.tva,
    paymentType: data.paymentType,
    linkedToCustomer: Boolean(customer?.customerId),
    deleted: false,
  }));
  await db.insert(sales).values(salesList);
  await db.delete(cart).where(eq(cart.userId, userId));
  const total = salesList.reduce((t, sale) => t + Number(sale.price) * 100, 0);
  if (customer && customer.customerId) {
    const hasDiscount = cartItems.some(
      (it) => it.title === "Remise carte de fidélité",
    );
    if (hasDiscount) {
      await resetCustomer(customer.customerId);
    } else {
      await addPurchase(customer.customerId, total / 100);
    }
    await setSelectedCustomer({ asideCart: false, customerId: null, userId });
  }
  return {
    success: true,
    change:
      data.paymentType === "cash"
        ? Math.round(Number(data.amount) * 100 - total) / 100
        : null,
  };
};

const addItemToCart = async (item: Item, userId: number, quantity = 1) => {
  const cartResult = await db.query.cart.findFirst({
    where: and(eq(cart.itemId, item.id), eq(cart.userId, userId)),
  });
  if (cartResult !== undefined) {
    await db
      .update(cart)
      .set({ quantity: sql`${cart.quantity} + ${quantity}` })
      .where(eq(cart.id, cartResult.id));
    return;
  }
  const cartItem: CartItem = {
    itemId: item.id,
    type: item.type,
    title: item.title,
    price: item.price,
    tva: item.tva,
    quantity,
    userId,
  };
  await db.insert(cart).values(cartItem);
};

export const addToCart = async (
  userId: number,
  itemId: number,
  quantity = 1,
) => {
  const result = await db
    .update(itemsTable)
    .set({ amount: sql`${itemsTable.amount} - ${quantity}` })
    .where(
      and(eq(itemsTable.id, itemId), sql`${itemsTable.amount} >= ${quantity}`),
    )
    .returning();
  if (result.length === 0) {
    throw new Error("Unable to find item");
  }
  await addItemToCart(result[0], userId, quantity);
};

export const addISBNToCart = async (userId: number, isbn: string) => {
  const result = await db
    .update(itemsTable)
    .set({ amount: sql`${itemsTable.amount} - 1` })
    .where(and(eq(itemsTable.isbn, isbn), sql`${itemsTable.amount} >= 1`))
    .returning();
  if (result.length === 0) {
    const item = await db.query.items.findFirst({
      where: eq(itemsTable.isbn, isbn),
    });

    if (!item) {
      logger.info("ISBN non trouvé", { userId, isbn });
      return { errorCode: CART_ERRORS.ITEM_NOT_FOUND };
    }
    logger.info("Plus de stock", { userId, isbn });
    return {
      errorCode: CART_ERRORS.NO_STOCK,
      title: item.title,
      id: item.id,
    };
  }
  await addItemToCart(result[0], userId);
  return { errorCode: null };
};

export const addNewItemToCart = async (userId: number, item: NewCartItem) => {
  const cartItem: CartItem = {
    ...item,
    title: item.title || "Article indépendant",
    quantity: 1,
    userId,
  };
  await db.insert(cart).values(cartItem);
};

export const removeFromCart = async (cartItemId: number) => {
  const result = await db
    .delete(cart)
    .where(eq(cart.id, cartItemId))
    .returning();
  if (result.length === 0) {
    return;
  }
  const amount = result[0].quantity || 1;
  const id = result[0].itemId;
  logger.info("Remove from cart", { cartItemId, itemId: id });
  if (id) {
    await db
      .update(itemsTable)
      .set({ amount: sql`${itemsTable.amount} + ${amount}` })
      .where(eq(itemsTable.id, id));
  }
};

type CartName = "cart" | "asideCart";

const schema = { cart, asideCart };

const switchCarts = async (userId: number, from: CartName, to: CartName) => {
  logger.info("Switch cart", { from, userId });
  const items = await db
    .select()
    .from(schema[from])
    .where(eq(schema[from].userId, userId));

  await db.insert(schema[to]).values(items);
  await db.delete(schema[from]).where(eq(schema[from].userId, userId));

  await db
    .update(selectedCustomerTable)
    .set({ asideCart: from !== "asideCart" })
    .where(
      and(
        eq(selectedCustomerTable.userId, userId),
        eq(selectedCustomerTable.asideCart, from === "asideCart"),
        isNotNull(selectedCustomerTable.customerId),
      ),
    );
};

export const putCartAside = (userId: number) =>
  switchCarts(userId, "cart", "asideCart");
export const reactivateCart = async (userId: number) =>
  switchCarts(userId, "asideCart", "cart");

export const getAsideCart = async (userId: number) => {
  const cartItems = await db
    .select()
    .from(asideCart)
    .where(eq(asideCart.userId, userId));

  const total = cartItems.reduce(sumPrice, 0) / 100;
  const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  return { count, total };
};
