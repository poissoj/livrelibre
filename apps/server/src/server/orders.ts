import { ERROR_CODES } from "@livrelibre/shared/errors";
import {
  type OrderSort,
  type OrderStatus,
  type PaginatedOrders,
  type RawOrder,
  deserializeOrder,
} from "@livrelibre/shared/order";
import { ITEMS_PER_PAGE, ORDERS_GROUPS_PER_PAGE } from "@livrelibre/shared/pagination";
import { customers, items, orders } from "@livrelibre/shared/schema";
import { norm, sanitize } from "@livrelibre/shared/utils";
import { type User } from "@server/auth";
import { db } from "@server/db/database";
import { logger } from "@server/utils/logger";
import { TRPCError } from "@trpc/server";
import { and, asc, count, countDistinct, desc, eq, inArray, max, ne, or, sql } from "drizzle-orm";

export const getOrder = async (id: number) => {
  const rows = await db.select().from(orders).where(eq(orders.id, id));
  const dbOrder = rows.length > 0 ? rows[0] : null;
  if (dbOrder?.customerId) {
    const customer = await db.select().from(customers).where(eq(customers.id, dbOrder.customerId));
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

const orderColumns = {
  id: orders.id,
  created: orders.created,
  customerId: orders.customerId,
  itemId: orders.itemId,
  itemTitle: orders.itemTitle,
  ordered: orders.ordered,
  customerNotified: orders.customerNotified,
  paid: orders.paid,
  comment: orders.comment,
  nb: orders.nb,
  contact: orders.contact,
  customerName: customers.fullname,
  phone: customers.phone,
  email: customers.email,
  isbn: items.isbn,
  distributor: items.distributor,
};

const buildOrderWhere = (statuses: OrderStatus[], search: string) => {
  const statusFilter = inArray(orders.ordered, statuses);
  if (search === "") {
    return statusFilter;
  }
  const term = sanitize(norm(search));
  return and(
    statusFilter,
    or(
      sql`${customers.nmFullname} ~* ${term}`,
      sql`${orders.nmTitle} ~* ${term}`,
      sql`${items.isbn} ~* ${sanitize(search)}`,
    ),
  );
};

const flatOrderBy = (sortBy: OrderSort) => {
  switch (sortBy) {
    case "date":
      return [asc(orders.created), asc(orders.id)];
    case "name":
      return [asc(customers.fullname), desc(orders.created), asc(orders.id)];
    case "nameDesc":
      return [desc(customers.fullname), desc(orders.created), asc(orders.id)];
    case "distributor":
      return [asc(items.distributor), desc(orders.created), asc(orders.id)];
    case "distributorDesc":
      return [desc(items.distributor), desc(orders.created), asc(orders.id)];
    case "status":
      return [asc(orders.ordered), desc(orders.created), asc(orders.id)];
    case "statusDesc":
      return [desc(orders.ordered), desc(orders.created), asc(orders.id)];
    default:
      return [desc(orders.created), asc(orders.id)];
  }
};

const groupOrderBy = (sortBy: OrderSort) => {
  switch (sortBy) {
    case "name":
      return [asc(customers.fullname)];
    case "nameDesc":
      return [desc(customers.fullname)];
    case "date":
      return [asc(max(orders.created))];
    default:
      return [desc(max(orders.created))];
  }
};

export const getOrders = async ({
  statuses,
  pageNumber = 1,
  grouped = true,
  search = "",
  sortBy = "dateDesc",
}: {
  statuses: OrderStatus[];
  pageNumber?: number;
  grouped?: boolean;
  search?: string;
  sortBy?: OrderSort;
}): Promise<PaginatedOrders> => {
  if (statuses.length === 0) {
    return { items: [], count: 0, pageCount: 0 };
  }
  const statusFilter = inArray(orders.ordered, statuses);
  const where = buildOrderWhere(statuses, search);
  const offset = (pageNumber - 1) * ITEMS_PER_PAGE;
  const groupOffset = (pageNumber - 1) * ORDERS_GROUPS_PER_PAGE;

  if (!grouped) {
    const countPromise = db
      .select({ count: count() })
      .from(orders)
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .leftJoin(items, eq(orders.itemId, items.id))
      .where(where);
    const rowsPromise = db
      .select(orderColumns)
      .from(orders)
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .leftJoin(items, eq(orders.itemId, items.id))
      .where(where)
      .orderBy(...flatOrderBy(sortBy))
      .limit(ITEMS_PER_PAGE)
      .offset(offset);
    const [countResult, rows] = await Promise.all([countPromise, rowsPromise]);
    const total = countResult[0].count;
    return {
      items: rows,
      count: total,
      pageCount: Math.ceil(total / ITEMS_PER_PAGE),
    };
  }

  // The search selects the customer groups to display; every order of those
  // customers (matching the status filter) is then returned, not only the
  // orders matching the search.
  const matchingCustomerIds = db
    .select({ customerId: orders.customerId })
    .from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .leftJoin(items, eq(orders.itemId, items.id))
    .where(where)
    .groupBy(orders.customerId);
  const countPromise = db
    .select({ count: count() })
    .from(orders)
    .where(and(statusFilter, inArray(orders.customerId, matchingCustomerIds)));
  const groupCountPromise = db
    .select({ count: countDistinct(orders.customerId) })
    .from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .leftJoin(items, eq(orders.itemId, items.id))
    .where(where);
  const idsPromise = db
    .select({ customerId: orders.customerId })
    .from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .leftJoin(items, eq(orders.itemId, items.id))
    .where(where)
    .groupBy(orders.customerId, customers.fullname)
    .orderBy(...groupOrderBy(sortBy))
    .limit(ORDERS_GROUPS_PER_PAGE)
    .offset(groupOffset);
  const [countResult, groupCountResult, idRows] = await Promise.all([
    countPromise,
    groupCountPromise,
    idsPromise,
  ]);
  const total = countResult[0].count;
  const groupCount = groupCountResult[0].count;
  const pageCount = Math.ceil(groupCount / ORDERS_GROUPS_PER_PAGE);
  const customerIds = idRows.map((row) => row.customerId);
  if (customerIds.length === 0) {
    return { items: [], count: total, pageCount };
  }
  const rows = await db
    .select(orderColumns)
    .from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .leftJoin(items, eq(orders.itemId, items.id))
    .where(and(statusFilter, inArray(orders.customerId, customerIds)))
    .orderBy(desc(orders.created), asc(orders.id));
  return { items: rows, count: total, pageCount };
};

export const getCustomerActiveOrders = async (customerId: number) => {
  return await db
    .select()
    .from(orders)
    .where(and(eq(orders.customerId, customerId), ne(orders.ordered, "done")));
};

export const newOrder = async (order: RawOrder, user: User) => {
  const newOrder = {
    ...deserializeOrder(order),
    itemId: order.itemId ?? null,
    nmTitle: norm(order.itemTitle),
  };
  const customer = await db.select().from(customers).where(eq(customers.id, order.customerId));
  if (customer.length === 0) {
    logger.warn("New order rejected", {
      user: user.id,
      customerId: order.customerId,
      reason: "CUSTOMER_NOT_FOUND",
    });
    return { type: "error" as const, msg: "Client inconnu" };
  }
  if (order.itemId) {
    const rows = await db.select().from(items).where(eq(items.id, order.itemId));
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
    nmTitle: norm(order.itemTitle),
  };
  const rows = await db.update(orders).set(newOrder).where(eq(orders.id, id)).returning();
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

export const setCustomerNotified = async (orderId: number, customerNotified: boolean) => {
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
  const rows = await db.delete(orders).where(eq(orders.id, orderId)).returning();
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
