import { ObjectId, WithId } from "mongodb";

import type { DBItem, ItemType, TVA } from "@/utils/item";
import { PAYMENT_METHODS, PaymentType } from "@/utils/sale";
import { isDefined, isIn } from "@/utils/utils";

import { getDb } from "./database";

type DBSale = {
  cartId?: ObjectId;
  date: string;
  id: ObjectId | null;
  itemType: ItemType;
  price: number;
  quantity: number;
  title?: string;
  tva?: TVA;
  type?: PaymentType;
  deleted?: boolean;
};

type AggregatedSale = WithId<
  Pick<
    DBSale,
    | "cartId"
    | "id"
    | "price"
    | "title"
    | "tva"
    | "type"
    | "quantity"
    | "deleted"
  >
>;

type PaymentMethod = typeof PAYMENT_METHODS[PaymentType] | "Inconnu";

type ItemSale = Omit<DBItem, "price" | "type"> & {
  itemId: string;
  price: number;
  type: PaymentMethod;
  quantity: number;
  deleted: boolean;
  _id: string;
};

type UnlistedSale = Omit<AggregatedSale, "type" | "_id" | "cartId"> & {
  type: PaymentMethod;
  itemId: null;
  deleted: boolean;
  _id: string;
  cartId: string | undefined;
};

type Sale = ItemSale | UnlistedSale;

export const getSalesByDay = async (date: string) => {
  const db = await getDb();
  const dbSales = await db
    .collection("sales")
    .aggregate<AggregatedSale>([
      { $match: { date } },
      {
        $project: {
          cartId: 1,
          id: 1,
          price: 1,
          title: 1,
          tva: 1,
          type: 1,
          quantity: 1,
          deleted: 1,
        },
      },
    ])
    .toArray();

  const itemIds = dbSales.map((s) => s.id).filter(isDefined);
  const items = await db
    .collection<DBItem>("books")
    .find({ _id: { $in: itemIds } })
    .toArray();

  const tvaStats: Record<
    string,
    { count: number; total: number; type: PaymentMethod }
  > = {};
  const paymentStats: Record<string, { count: number; total: number }> = {};
  let salesCount = 0;
  let lastCartId = dbSales[0]?.cartId;

  const carts: { sales: Sale[] }[] = [];
  let sales: Sale[] = [];
  for (const sale of dbSales) {
    if (lastCartId && sale.cartId && !sale.cartId.equals(lastCartId)) {
      carts.push({ sales });
      sales = [];
    }
    lastCartId = sale.cartId;

    const type =
      sale.type && isIn(PAYMENT_METHODS, sale.type)
        ? PAYMENT_METHODS[sale.type]
        : "Inconnu";
    const key = [sale.tva || "Inconnu", type].join();
    tvaStats[key] = tvaStats[key] || { count: 0, total: 0, type };
    paymentStats[type] = paymentStats[type] || { count: 0, total: 0 };

    if (!sale.deleted) {
      tvaStats[key].count += sale.quantity;
      tvaStats[key].total += sale.price;
      salesCount += sale.quantity;
      paymentStats[type].count += sale.quantity;
      paymentStats[type].total += sale.price;
    }

    const deleted = Boolean(sale.deleted);
    if (sale.id) {
      let i = 0;
      while (i < items.length && !items[i]._id.equals(sale.id)) {
        i++;
      }
      if (i === items.length) {
        throw new Error(`Item ${sale.id.toString()} not found`);
      }
      sales.push({
        ...items[i],
        itemId: sale.id.toString(),
        price: sale.price,
        type,
        quantity: sale.quantity,
        deleted,
        _id: sale._id.toString(),
      });
    } else {
      sales.push({
        ...sale,
        type,
        itemId: null,
        deleted,
        _id: sale._id.toString(),
        cartId: sale.cartId?.toString(),
      });
    }
  }
  if (sales.length > 0) {
    carts.push({ sales });
  }

  const stats = Object.keys(tvaStats)
    .map((item) => {
      const [tva] = item.split(",");
      return [
        tva,
        tvaStats[item].type,
        tvaStats[item].count,
        tvaStats[item].total.toFixed(2),
      ] as const;
    })
    .sort((a, b) => Number(b[0]) - Number(a[0]) || a[1].localeCompare(b[1]));

  const paymentMethods = Object.entries(paymentStats)
    .map(([type, data]) => ({
      type: type as PaymentMethod,
      nb: data.count,
      totalPrice: data.total.toFixed(2),
    }))
    .sort((a, b) => b.nb - a.nb);

  return {
    carts,
    tva: stats,
    salesCount,
    paymentMethods,
  };
};

export const deleteSale = async (saleId: string, itemId?: string | null) => {
  const db = await getDb();
  const result = await db
    .collection<DBSale>("sales")
    .findOneAndUpdate(
      { _id: new ObjectId(saleId) },
      { $set: { deleted: true } }
    );
  const item = result.value;
  if (itemId && item) {
    const amount = item.quantity || 1;
    await db
      .collection<DBItem>("books")
      .findOneAndUpdate({ _id: new ObjectId(itemId) }, { $inc: { amount } });
  }
};
