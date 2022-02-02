import type { DBItem, Item, TVA } from "@/utils/item";
import { PaymentType, PAYMENT_METHODS } from "@/utils/sale";
import { isDefined, isIn } from "@/utils/utils";
import type { ObjectId } from "mongodb";
import { getDb } from "./database";

type DBSale = {
  _id: ObjectId;
  id: ObjectId | null;
  price: number;
  quantity: number;
  cartId?: ObjectId;
  title?: string;
  tva?: TVA;
  type?: PaymentType;
  deleted?: boolean;
};

type PaymentMethod = typeof PAYMENT_METHODS[PaymentType] | "Inconnu";

type ItemSale = Omit<Item, "price"> & {
  itemId: string;
  saleItemId: string;
  price: number;
  type: PaymentMethod;
  quantity: number;
  deleted: boolean;
};

type UnlistedSale = Omit<DBSale, "type" | "_id" | "cartId"> & {
  saleItemId: string;
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
    .aggregate<DBSale>([
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
      paymentStats[type].total += sale.quantity * sale.price;
    }

    const deleted = Boolean(sale.deleted);
    if (sale.id) {
      let i = 0;
      while (i < items.length && !items[i]._id.equals(sale.id)) {
        i++;
      }
      if (i === items.length) {
        throw new Error("Unknown id");
      }
      sales.push({
        ...items[i],
        itemId: sale.id.toString(),
        saleItemId: [sale._id, sale.id].join(),
        price: sale.price,
        type,
        quantity: sale.quantity,
        deleted,
        _id: items[i]._id.toString(),
      });
    } else {
      sales.push({
        ...sale,
        saleItemId: sale._id.toString(),
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
  };
};
