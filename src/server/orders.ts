import { and, count, eq, getTableColumns, inArray, ne } from "drizzle-orm";

import { db } from "@/db/database";
import { customers, items, orders } from "@/db/schema";
import { logger } from "@/utils/logger";
import {
  type OrderRow,
  type OrderStatus,
  type RawOrder,
  deserializeOrder,
} from "@/utils/order";

export const getOrder = async (id: number) => {
  const rows = await db.select().from(orders).where(eq(orders.id, id));
  const dbOrder = rows.length > 0 ? rows[0] : null;
  if (dbOrder?.customerId) {
    const customer = await db
      .select()
      .from(customers)
      .where(eq(customers.id, dbOrder.customerId));
    if (customer.length === 0) {
      throw new Error("Invalid customerId");
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

export const newOrder = async (order: RawOrder) => {
  const newOrder = { ...deserializeOrder(order), itemId: order.itemId ?? null };
  try {
    const customer = await db
      .select()
      .from(customers)
      .where(eq(customers.id, Number(order.customerId)));
    if (customer.length === 0) {
      return { type: "error" as const, msg: "Client inconnu" };
    }
    if (order.itemId) {
      const rows = await db
        .select()
        .from(items)
        .where(eq(items.id, order.itemId));
      const item = rows.length > 0 ? rows[0] : null;
      if (item == null) {
        return { type: "error" as const, msg: "Article invalide" };
      }
    } else {
      newOrder.itemId = null;
    }
    await db.insert(orders).values(newOrder);
    return { type: "success" as const, msg: "La commande a été ajoutée" };
  } catch (error) {
    logger.error(error);
    return { type: "error" as const, msg: "Impossible d'ajouter la commande" };
  }
};

export const setOrder = async (order: RawOrder, id: number) => {
  try {
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
      return { type: "error" as const, msg: "La commande n'existe pas" };
    }
    return { type: "success" as const, msg: "La commande a été modifiée" };
  } catch (error) {
    logger.error(error);
    return {
      type: "error" as const,
      msg: "Impossible de modifier la commande",
    };
  }
};

export const deleteOrder = async (orderId: number) => {
  try {
    const rows = await db
      .delete(orders)
      .where(eq(orders.id, orderId))
      .returning();
    if (rows.length === 0) {
      return { type: "error" as const, msg: "La commande n'existe pas" };
    }
    return { type: "success" as const, msg: "La commande a été supprimée" };
  } catch (error) {
    logger.error(error);
    return {
      type: "error" as const,
      msg: "Impossible de supprimer la commande",
    };
  }
};
