import { formatDate } from "@livrelibre/shared/date";
import { ERROR_CODES } from "@livrelibre/shared/errors";
import type { ItemType, TVA } from "@livrelibre/shared/item";
import {
  type CartItemKind,
  LOYALTY_DISCOUNT_TITLE,
  type PaymentType,
} from "@livrelibre/shared/sale";
import {
  type Item,
  SALES_RECEIPT_ID_SEQ,
  asideCart,
  cart,
  items as itemsTable,
  sales,
  selectedCustomer as selectedCustomerTable,
} from "@livrelibre/shared/schema";
import { type Transaction, db } from "@server/db/database";
import {
  addPurchase,
  getSelectedCustomer,
  resetCustomer,
  setSelectedCustomer,
} from "@server/server/customers";
import { logger } from "@server/utils/logger";
import { TRPCError } from "@trpc/server";
import { and, eq, isNotNull, sql } from "drizzle-orm";

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
  kind?: CartItemKind;
};

const roundMoney = (value: number): number => Math.round(value * 100) / 100;

const toMoneyString = (value: number): string => roundMoney(value).toFixed(2);

const sumPrice = (sum: number, item: CartItem) => sum + Number(item.price) * item.quantity;

export const getCart = async (userId: number) => {
  const cartItems = await db.select().from(cart).where(eq(cart.userId, userId));

  const total = roundMoney(cartItems.reduce(sumPrice, 0));
  const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  return { items: cartItems, count, total };
};

export type PaymentFormData = {
  paymentDate: string;
  paymentType: PaymentType;
};

export const payCart = async (userId: number, data: PaymentFormData) => {
  return await db.transaction(async (tx) => {
    // Delete first and lock the rows so concurrent payments cannot sell the
    // same cart twice: a second transaction will block, then see no rows.
    const cartItems = await tx.delete(cart).where(eq(cart.userId, userId)).returning();

    if (cartItems.length === 0) {
      logger.warn("Payment with empty cart", { userId });
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: ERROR_CODES.CART_EMPTY,
      });
    }
    const [receipt] = await tx.execute<{ receiptId: number }>(
      sql`SELECT nextval(${sql.raw(`'${SALES_RECEIPT_ID_SEQ}'`)})::int AS "receiptId"`,
    );
    const receiptId = receipt.receiptId;
    const customer = await getSelectedCustomer(userId, false, tx);
    const now = new Date();
    // If the date is today, we want to save the time too
    const created = formatDate(now) === data.paymentDate ? now : new Date(data.paymentDate);
    const salesList: (typeof sales.$inferInsert)[] = cartItems.map((item) => ({
      receiptId,
      created,
      itemId: item.itemId,
      itemType: item.type,
      price: toMoneyString(Number(item.price) * item.quantity),
      quantity: item.quantity,
      title: item.title,
      tva: item.tva,
      paymentType: data.paymentType,
      linkedToCustomer: Boolean(customer?.customerId),
      deleted: false,
    }));
    await tx.insert(sales).values(salesList);
    const total = roundMoney(salesList.reduce((t, sale) => t + Number(sale.price), 0));
    const customerId = customer?.customerId ?? null;
    const hasDiscount = cartItems.some((it) => it.title === LOYALTY_DISCOUNT_TITLE);
    if (customerId != null) {
      if (hasDiscount) {
        await resetCustomer(customerId, tx);
        logger.info("Customer purchases reset", { customerId });
      } else {
        await addPurchase(customerId, total, tx);
        logger.info("Customer purchase recorded", {
          customerId,
          amount: total,
        });
      }
      await setSelectedCustomer({ asideCart: false, customerId: null, userId }, tx);
    }
    logger.info("Sale completed", {
      receiptId,
      userId,
      customerId,
      itemCount: salesList.length,
      total,
      paymentType: data.paymentType,
      linkedToCustomer: customerId != null,
      loyaltyDiscount: hasDiscount,
    });
    return {
      success: true,
    };
  });
};

const addItemToCart = async (item: Item, userId: number, quantity = 1, tx?: Transaction) => {
  const conn = tx ?? db;
  const cartItem: CartItem = {
    itemId: item.id,
    type: item.type,
    title: item.title,
    price: item.price,
    tva: item.tva,
    quantity,
    userId,
  };
  await conn
    .insert(cart)
    .values(cartItem)
    .onConflictDoUpdate({
      target: [cart.itemId, cart.userId],
      targetWhere: sql`${cart.itemId} IS NOT NULL`,
      set: { quantity: sql`${cart.quantity} + ${quantity}` },
    });
};

export const addToCart = async (userId: number, itemId: number, quantity = 1) => {
  await db.transaction(async (tx) => {
    const result = await tx
      .update(itemsTable)
      .set({ amount: sql`${itemsTable.amount} - ${quantity}` })
      .where(and(eq(itemsTable.id, itemId), sql`${itemsTable.amount} >= ${quantity}`))
      .returning();
    if (result.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: ERROR_CODES.ITEM_UNAVAILABLE,
      });
    }
    await addItemToCart(result[0], userId, quantity, tx);
  });
};

type AddIsbnToCartResult =
  | { errorCode: "ITEM_NOT_FOUND" }
  | { errorCode: "NO_STOCK"; title: string; id: number }
  | { errorCode: null };

export const addISBNToCart = async (userId: number, isbn: string): Promise<AddIsbnToCartResult> => {
  return await db.transaction(async (tx) => {
    const result = await tx
      .update(itemsTable)
      .set({ amount: sql`${itemsTable.amount} - 1` })
      .where(and(eq(itemsTable.isbn, isbn), sql`${itemsTable.amount} >= 1`))
      .returning();
    if (result.length === 0) {
      const item = await tx.query.items.findFirst({
        where: eq(itemsTable.isbn, isbn),
      });

      if (!item) {
        logger.info("Book not found", { userId, isbn });
        return { errorCode: "ITEM_NOT_FOUND" };
      }
      logger.info("Out of stock", { userId, isbn });
      return {
        errorCode: "NO_STOCK",
        title: item.title,
        id: item.id,
      };
    }
    await addItemToCart(result[0], userId, 1, tx);
    return { errorCode: null };
  });
};

export const addNewItemToCart = async (userId: number, item: NewCartItem) => {
  const { kind = "standalone", ...data } = item;
  if (kind === "loyaltyDiscount") {
    const customer = await getSelectedCustomer(userId, false);
    logger.info("Loyalty discount applied", {
      userId,
      amount: item.price,
      customerId: customer?.customerId ?? null,
    });
  } else {
    logger.info("Standalone item added", { userId, type: item.type });
  }
  const cartItem: CartItem = {
    ...data,
    title: item.title || "Article indépendant",
    quantity: 1,
    userId,
  };
  await db.insert(cart).values(cartItem);
};

export const removeFromCart = async (userId: number, cartItemId: number) => {
  await db.transaction(async (tx) => {
    const result = await tx
      .delete(cart)
      .where(and(eq(cart.id, cartItemId), eq(cart.userId, userId)))
      .returning();
    if (result.length === 0) {
      return;
    }
    const amount = result[0].quantity || 1;
    const id = result[0].itemId;
    logger.info("Remove from cart", { userId, cartItemId, itemId: id });
    if (id) {
      await tx
        .update(itemsTable)
        .set({ amount: sql`${itemsTable.amount} + ${amount}` })
        .where(eq(itemsTable.id, id));
    }
  });
};

type CartName = "cart" | "asideCart";

const schema = { cart, asideCart };

const switchCarts = async (userId: number, from: CartName, to: CartName) => {
  logger.debug("Switch cart", { from, userId });
  return await db.transaction(async (tx) => {
    // Delete first to lock the rows and never lose a concurrent insertion:
    // rows added to the source during the switch stay in the source cart.
    const moved = await tx.delete(schema[from]).where(eq(schema[from].userId, userId)).returning();

    if (moved.length > 0) {
      await tx
        .insert(schema[to])
        .values(moved.map(({ id: _id, ...rest }) => rest))
        .onConflictDoUpdate({
          target: [schema[to].itemId, schema[to].userId],
          targetWhere: sql`${schema[to].itemId} IS NOT NULL`,
          set: { quantity: sql`${schema[to].quantity} + excluded.quantity` },
        });
    }

    await tx
      .update(selectedCustomerTable)
      .set({ asideCart: from !== "asideCart" })
      .where(
        and(
          eq(selectedCustomerTable.userId, userId),
          eq(selectedCustomerTable.asideCart, from === "asideCart"),
          isNotNull(selectedCustomerTable.customerId),
        ),
      );

    return moved.length;
  });
};

export const putCartAside = async (userId: number) => {
  const itemCount = await switchCarts(userId, "cart", "asideCart");
  logger.info("Cart put aside", { userId, itemCount });
};

export const reactivateCart = async (userId: number) => {
  const itemCount = await switchCarts(userId, "asideCart", "cart");
  logger.info("Cart reactivated", { userId, itemCount });
};

export const getAsideCart = async (userId: number) => {
  const cartItems = await db.select().from(asideCart).where(eq(asideCart.userId, userId));

  const total = roundMoney(cartItems.reduce(sumPrice, 0));
  const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  return { count, total };
};
