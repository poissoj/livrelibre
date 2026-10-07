import { TRPCError } from "@trpc/server";
import { and, count, eq, getTableColumns, inArray, ne } from "drizzle-orm";

import { ERROR_CODES } from "@livrelibre/shared/errors";
import {
  type OrderRow,
  type OrderStatus,
  type RawOrder,
  deserializeOrder,
} from "@livrelibre/shared/order";
import { customers, items, orders } from "@livrelibre/shared/schema";

import { type User } from "@server/auth";
import { db } from "@server/db/database";
import { logger } from "@server/utils/logger";

export const getOrder = async (id: number) => {
  const rows = await db.select().from(orders).where(eq(orders.id, id));
  const dbOrder = rows.length > 0 ? rows[0] : null;
  if (dbOrder?.customerId) {
    const customer = await db
      .select()
      .from(customers)
      .where(eq(customers.id, dbOrder.customerId));
    if (customer.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: ERROR_CODES.CUSTOMER_NOT_FOUND,
      });
    }
    const item = dbOrder.itemId
      ? await db.query.items.findFirst({ where: eq(items.id, dbOrder.itemId) })
      : null;
    return { ...dbOrder, customer: customer[0], item };
  }
  return null;
};

export const getItemOrders = async (itemId: number) => {
  return await db
    .select({
      status: orders.ordered,
      count: count(),
    })
    .from(orders)
    .where(and(eq(orders.itemId, itemId), ne(orders.ordered, "done")))
    .groupBy(orders.ordered);
};

export const getOrders = async (status: OrderStatus[]): Promise<OrderRow[]> => {
  return await db
    .select({
      ...getTableColumns(orders),
      customerName: customers.fullname,
      phone: customers.phone,
      email: customers.email,
      isbn: items.isbn,
      distributor: items.distributor,
    })
    .from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .leftJoin(items, eq(orders.itemId, items.id))
    .where(inArray(orders.ordered, status));
};

export const getCustomerActiveOrders = async (customerId: number) => {
  return await db
    .select()
    .from(orders)
    .where(and(eq(orders.customerId, customerId), ne(orders.ordered, "done")));
};

export const newOrder = async (order: RawOrder, user: User) => {
  const newOrder = { ...deserializeOrder(order), itemId: order.itemId ?? null };
  const customer = await db
    .select()
    .from(customers)
    .where(eq(customers.id, order.customerId));
  if (customer.length === 0) {
    logger.warn("New order rejected", {
      user: user.id,
      customerId: order.customerId,
      reason: "CUSTOMER_NOT_FOUND",
    });
    return { type: "error" as const, msg: "Client inconnu" };
  }
  if (order.itemId) {
    const rows = await db
      .select()
      .from(items)
      .where(eq(items.id, order.itemId));
    const item = rows.length > 0 ? rows[0] : null;
    if (item == null) {
      logger.warn("New order rejected", {
        user: user.id,
        customerId: order.customerId,
        itemId: order.itemId,
        reason: "ITEM_NOT_FOUND",
      });
      return { type: "error" as const, msg: "Article invalide" };
    }
  } else {
    newOrder.itemId = null;
  }
  await db.insert(orders).values(newOrder);
  return { type: "success" as const, msg: "La commande a été ajoutée" };
};

export const setOrder = async (order: RawOrder, id: number, user: User) => {
  const newOrder = {
    ...deserializeOrder(order),
    itemId: order.itemId ?? null,
  };
  const rows = await db
    .update(orders)
    .set(newOrder)
    .where(eq(orders.id, id))
    .returning();
  if (rows.length === 0) {
    logger.warn("Order update rejected", {
      user: user.id,
      orderId: id,
      reason: "NOT_FOUND",
    });
    return { type: "error" as const, msg: "La commande n'existe pas" };
  }
  return { type: "success" as const, msg: "La commande a été modifiée" };
};

export const setCustomerNotified = async (
  orderId: number,
  customerNotified: boolean,
) => {
  const rows = await db
    .update(orders)
    .set({ customerNotified })
    .where(eq(orders.id, orderId))
    .returning();
  if (rows.length === 0) {
    throw new TRPCError({
      message: ERROR_CODES.ORDER_NOT_FOUND,
      code: "BAD_REQUEST",
    });
  }
  return { msg: "La commande a été modifiée" };
};

export const deleteOrder = async (orderId: number, user: User) => {
  const rows = await db
    .delete(orders)
    .where(eq(orders.id, orderId))
    .returning();
  if (rows.length === 0) {
    logger.warn("Order deletion rejected", {
      user: user.id,
      orderId,
      reason: "NOT_FOUND",
    });
    return { type: "error" as const, msg: "La commande n'existe pas" };
  }
  return { type: "success" as const, msg: "La commande a été supprimée" };
};
