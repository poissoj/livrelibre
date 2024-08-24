import { eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db/database";
import { items, sales } from "@/db/schema";
import type { DBItem, TVA } from "@/utils/item";
import { type PaymentType } from "@/utils/sale";
import { isDefined } from "@/utils/utils";

type AggregatedSale = Pick<
  typeof sales.$inferSelect,
  | "cartId"
  | "id"
  | "title"
  | "tva"
  | "paymentType"
  | "quantity"
  | "deleted"
  | "linkedToCustomer"
> & { price: number };

type ItemSale = Omit<DBItem, "price" | "type"> & {
  itemId: number;
  price: number;
  paymentType: PaymentType | null;
  quantity: number;
  deleted: boolean;
  id: number;
  linkedToCustomer: boolean | undefined;
};

type UnlistedSale = Omit<AggregatedSale, "paymentType" | "id" | "cartId"> & {
  paymentType: PaymentType | null;
  itemId: null;
  deleted: boolean;
  id: number;
  cartId: number | null;
};

type Sale = ItemSale | UnlistedSale;

export const getSalesByDay = async (date: string) => {
  const dbSales = await db
    .select({
      id: sales.id,
      itemId: sales.itemId,
      cartId: sales.cartId,
      price: sql`${sales.price}`.mapWith(Number),
      title: sales.title,
      tva: sales.tva,
      paymentType: sales.paymentType,
      quantity: sales.quantity,
      deleted: sales.deleted,
      linkedToCustomer: sales.linkedToCustomer,
    })
    .from(sales)
    .where(eq(sql`CAST(${sales.created} AS date)`, date))
    .orderBy(sales.created, sales.cartId, sales.title);

  const itemIds = dbSales.map((s) => s.itemId).filter(isDefined);
  const itemList = await db
    .select()
    .from(items)
    .where(inArray(items.id, itemIds));

  const tvaStats = new Map<
    string,
    { count: number; total: number; type: PaymentType | null }
  >();
  const paymentStats = new Map<
    PaymentType | "unknown",
    { count: number; total: number }
  >();
  let salesCount = 0;
  let lastCartId = dbSales[0]?.cartId;
  let total = 0;

  const carts: { sales: Sale[] }[] = [];
  let salesList: Sale[] = [];
  for (const sale of dbSales) {
    if (lastCartId && sale.cartId && sale.cartId !== lastCartId) {
      carts.push({ sales: salesList });
      salesList = [];
    }
    lastCartId = sale.cartId;

    const paymentType = sale.paymentType;
    const key = [sale.tva || "Inconnu", paymentType].join();
    let tvaStat = tvaStats.get(key);
    if (!tvaStat) {
      tvaStat = { count: 0, total: 0, type: paymentType };
      tvaStats.set(key, tvaStat);
    }
    let paymentStat = paymentStats.get(paymentType ?? "unknown");
    if (!paymentStat) {
      paymentStat = { count: 0, total: 0 };
      paymentStats.set(paymentType ?? "unknown", paymentStat);
    }

    if (!sale.deleted) {
      tvaStat.count += sale.quantity;
      tvaStat.total += sale.price;
      salesCount += sale.quantity;
      paymentStat.count += sale.quantity;
      paymentStat.total += sale.price;
      total += sale.price;
    }

    const deleted = Boolean(sale.deleted);
    if (sale.itemId) {
      let i = 0;
      while (i < itemList.length && itemList[i].id !== sale.itemId) {
        i++;
      }
      if (i === itemList.length) {
        throw new Error(`Item ${sale.itemId} not found`);
      }
      salesList.push({
        ...itemList[i],
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
        cartId: sale.cartId,
      });
    }
  }
  if (salesList.length > 0) {
    carts.push({ sales: salesList });
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
    .sort(
      (a, b) =>
        Number(b.tva) - Number(a.tva) ||
        (a.paymentType ?? "unknown").localeCompare(b.paymentType ?? "unknown"),
    );

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

export const deleteSale = async (saleId: number, itemId?: number | null) => {
  const item = await db
    .update(sales)
    .set({ deleted: true })
    .where(eq(sales.id, saleId))
    .returning();
  if (itemId && item.length > 0) {
    const amount = item[0].quantity || 1;
    await db
      .update(items)
      .set({ amount: sql`${items.amount} + ${amount}` })
      .where(eq(items.id, itemId));
  }
};
