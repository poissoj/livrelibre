import { ERROR_CODES } from "@livrelibre/shared/errors";
import type { DBItem, TVA } from "@livrelibre/shared/item";
import { type PaymentType } from "@livrelibre/shared/sale";
import { items, sales } from "@livrelibre/shared/schema";
import { isDefined } from "@livrelibre/shared/utils";
import { type User } from "@server/auth";
import { db } from "@server/db/database";
import { logger } from "@server/utils/logger";
import { TRPCError } from "@trpc/server";
import { and, eq, inArray, sql } from "drizzle-orm";

type AggregatedSale = Pick<
  typeof sales.$inferSelect,
  "receiptId" | "id" | "title" | "tva" | "paymentType" | "quantity" | "deleted" | "linkedToCustomer"
> & { price: number };

type ItemSale = Omit<DBItem, "price" | "type"> & {
  itemId: number;
  price: number;
  paymentType: PaymentType;
  quantity: number;
  deleted: boolean;
  id: number;
  linkedToCustomer: boolean | undefined;
};

type UnlistedSale = Omit<AggregatedSale, "paymentType" | "id" | "receiptId"> & {
  paymentType: PaymentType;
  itemId: null;
  deleted: boolean;
  id: number;
  receiptId: number | null;
};

type Sale = ItemSale | UnlistedSale;

const getCurrentDate = async () => {
  const rows = await db.execute<{ today: string }>(
    sql`SELECT to_char(CURRENT_DATE, 'YYYY-MM-DD') AS today`,
  );
  return rows[0].today;
};

export const getSalesByDay = async (date: string, options?: { restrictToToday?: boolean }) => {
  const effectiveDate = options?.restrictToToday ? await getCurrentDate() : date;
  const dbSales = await db
    .select({
      id: sales.id,
      itemId: sales.itemId,
      receiptId: sales.receiptId,
      price: sql`${sales.price}`.mapWith(Number),
      title: sales.title,
      tva: sales.tva,
      paymentType: sales.paymentType,
      quantity: sales.quantity,
      deleted: sales.deleted,
      linkedToCustomer: sales.linkedToCustomer,
    })
    .from(sales)
    .where(
      and(
        sql`${sales.created} >= ${effectiveDate}::date`,
        sql`${sales.created} < ${effectiveDate}::date + interval '1 day'`,
      ),
    )
    .orderBy(sales.created, sales.receiptId, sales.title);

  const itemIds = dbSales.map((s) => s.itemId).filter(isDefined);
  const itemList = await db.select().from(items).where(inArray(items.id, itemIds));

  const itemById = new Map(itemList.map((item) => [item.id, item]));

  const tvaStats = new Map<string, { count: number; total: number; type: PaymentType }>();
  const paymentStats = new Map<PaymentType, { count: number; total: number }>();
  let salesCount = 0;
  let lastReceiptId = dbSales[0]?.receiptId;
  let total = 0;

  const carts: { sales: Sale[]; total: number }[] = [];
  let salesList: Sale[] = [];
  let cartTotal = 0;
  for (const sale of dbSales) {
    if (lastReceiptId && sale.receiptId && sale.receiptId !== lastReceiptId) {
      carts.push({ sales: salesList, total: cartTotal });
      salesList = [];
      cartTotal = 0;
    }
    lastReceiptId = sale.receiptId;

    const paymentType = sale.paymentType;
    const key = [sale.tva, paymentType].join();
    let tvaStat = tvaStats.get(key);
    if (!tvaStat) {
      tvaStat = { count: 0, total: 0, type: paymentType };
      tvaStats.set(key, tvaStat);
    }
    let paymentStat = paymentStats.get(paymentType);
    if (!paymentStat) {
      paymentStat = { count: 0, total: 0 };
      paymentStats.set(paymentType, paymentStat);
    }

    if (!sale.deleted) {
      tvaStat.count += sale.quantity;
      tvaStat.total += sale.price;
      salesCount += sale.quantity;
      paymentStat.count += sale.quantity;
      paymentStat.total += sale.price;
      total += sale.price;
      cartTotal += sale.price;
    }

    const deleted = sale.deleted;
    if (sale.itemId) {
      const item = itemById.get(sale.itemId);
      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: ERROR_CODES.ITEM_NOT_FOUND,
        });
      }
      salesList.push({
        ...item,
        itemId: sale.itemId,
        price: sale.price,
        paymentType,
        quantity: sale.quantity,
        deleted,
        id: sale.id,
        linkedToCustomer: sale.linkedToCustomer,
      });
    } else {
      salesList.push({
        ...sale,
        paymentType,
        itemId: null,
        deleted,
        id: sale.id,
        receiptId: sale.receiptId,
      });
    }
  }
  if (salesList.length > 0) {
    carts.push({ sales: salesList, total: cartTotal });
  }

  const stats = [...tvaStats.entries()]
    .map(([key, tvaStat]) => {
      const [tva] = key.split(",");
      return {
        tva: tva as TVA,
        paymentType: tvaStat.type,
        nb: tvaStat.count,
        total: tvaStat.total.toFixed(2),
      };
    })
    .sort((a, b) => Number(b.tva) - Number(a.tva) || a.paymentType.localeCompare(b.paymentType));

  const paymentMethods = [...paymentStats.entries()]
    .map(([type, data]) => ({
      type,
      nb: data.count,
      total: data.total.toFixed(2),
    }))
    .sort((a, b) => b.nb - a.nb);

  return {
    carts,
    tva: stats,
    salesCount,
    paymentMethods,
    total,
  };
};

export const deleteSale = async (
  saleId: number,
  user: User,
  options?: { restrictToToday?: boolean },
) => {
  await db.transaction(async (tx) => {
    if (options?.restrictToToday) {
      const todaySales = await tx
        .select({ id: sales.id })
        .from(sales)
        .where(
          and(
            eq(sales.id, saleId),
            sql`${sales.created} >= CURRENT_DATE`,
            sql`${sales.created} < CURRENT_DATE + interval '1 day'`,
          ),
        );
      if (todaySales.length === 0) {
        const existing = await tx.select({ id: sales.id }).from(sales).where(eq(sales.id, saleId));
        if (existing.length > 0) {
          logger.warn("Sale deletion ignored", {
            user: user.id,
            saleId,
            reason: "not-today",
          });
          throw new TRPCError({
            code: "FORBIDDEN",
            message: ERROR_CODES.SALE_NOT_TODAY,
          });
        }
        logger.warn("Sale deletion ignored", {
          user: user.id,
          saleId,
          reason: "not-found",
        });
        return;
      }
    }
    const updated = await tx
      .update(sales)
      .set({ deleted: true })
      .where(and(eq(sales.id, saleId), eq(sales.deleted, false)))
      .returning();
    if (updated.length === 0) {
      logger.warn("Sale deletion ignored", {
        user: user.id,
        saleId,
        reason: "not-found",
      });
      return;
    }
    logger.info("Sale deleted", { user: user.id, saleId });
    const sale = updated[0];
    if (!sale.itemId) {
      return;
    }
    const amount = sale.quantity || 1;
    await tx
      .update(items)
      .set({ amount: sql`${items.amount} + ${amount}` })
      .where(eq(items.id, sale.itemId));
  });
};
