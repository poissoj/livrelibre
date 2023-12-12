import { ObjectId, type WithId } from "mongodb";

import type { DBItem } from "@/utils/item";
import { DBSale, PAYMENT_METHODS, type PaymentType } from "@/utils/sale";
import { isDefined, isIn } from "@/utils/utils";

import { getDb } from "./database";

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
    | "linkedToCustomer"
  >
>;

type PaymentMethod = (typeof PAYMENT_METHODS)[PaymentType] | "Inconnu";

type ItemSale = Omit<DBItem, "price" | "type"> & {
  itemId: string;
  price: number;
  type: PaymentMethod;
  quantity: number;
  deleted: boolean;
  _id: string;
  linkedToCustomer: boolean | undefined;
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
          linkedToCustomer: 1,
        },
      },
    ])
    .toArray();

  const itemIds = dbSales.map((s) => s.id).filter(isDefined);
  const items = await db
    .collection<DBItem>("books")
    .find({ _id: { $in: itemIds } })
    .toArray();

  const tvaStats = new Map<
    string,
    { count: number; total: number; type: PaymentMethod }
  >();
  const paymentStats = new Map<
    PaymentMethod,
    { count: number; total: number }
  >();
  let salesCount = 0;
  let lastCartId = dbSales[0]?.cartId;
  let total = 0;

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
    let tvaStat = tvaStats.get(key);
    if (!tvaStat) {
      tvaStat = { count: 0, total: 0, type };
      tvaStats.set(key, tvaStat);
    }
    let paymentStat = paymentStats.get(type);
    if (!paymentStat) {
      paymentStat = { count: 0, total: 0 };
      paymentStats.set(type, paymentStat);
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
        linkedToCustomer: sale.linkedToCustomer,
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

  const stats = [...tvaStats.entries()]
    .map(([key, tvaStat]) => {
      const [tva] = key.split(",");
      return {
        tva,
        type: tvaStat.type,
        nb: tvaStat.count,
        totalPrice: tvaStat.total.toFixed(2),
      };
    })
    .sort(
      (a, b) => Number(b.tva) - Number(a.tva) || a.type.localeCompare(b.type),
    );

  const paymentMethods = [...paymentStats.entries()]
    .map(([type, data]) => ({
      type,
      nb: data.count,
      totalPrice: data.total.toFixed(2),
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

export const deleteSale = async (saleId: string, itemId?: string | null) => {
  const db = await getDb();
  const item = await db
    .collection<DBSale>("sales")
    .findOneAndUpdate(
      { _id: new ObjectId(saleId) },
      { $set: { deleted: true } },
    );
  if (itemId && item) {
    const amount = item.quantity || 1;
    await db
      .collection<DBItem>("books")
      .findOneAndUpdate({ _id: new ObjectId(itemId) }, { $inc: { amount } });
  }
};
