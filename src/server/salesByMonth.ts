import { ItemType, ITEM_TYPES, TVA } from "@/utils/item";
import { getDb } from "@/server/database";
import { PaymentType, PAYMENT_METHODS } from "@/utils/sale";
import { isIn } from "@/utils/utils";

type DBSaleByMonth = {
  month: string;
  date: string;
  itemType: ItemType;
  price: number;
  tva?: TVA;
  type?: PaymentType;
  quantity: number;
};

export const getSalesByMonth = async (month: string, year: string) => {
  const db = await getDb();
  const sales = await db
    .collection("sales")
    .aggregate<DBSaleByMonth>([
      { $match: { deleted: { $exists: false } } },
      {
        $project: {
          month: { $substr: ["$date", 3, 7] },
          date: 1,
          itemType: 1,
          price: 1,
          tva: 1,
          type: 1,
          quantity: 1,
        },
      },
      { $match: { month: `${month}/${year}` } },
    ])
    .toArray();

  type Stat = { nb: number; totalPrice: number };
  const salesByDayStats: Record<string, Stat> = {};
  const tvaStats: Record<string, Stat> = {};
  const itemTypesStats: Record<ItemType, Stat> = {};

  for (const sale of sales) {
    salesByDayStats[sale.date] = salesByDayStats[sale.date] || {
      nb: 0,
      totalPrice: 0,
    };
    salesByDayStats[sale.date].nb += sale.quantity;
    salesByDayStats[sale.date].totalPrice += sale.price;

    const tvaAndType = [sale.tva || "Inconnu", sale.type].join();
    tvaStats[tvaAndType] = tvaStats[tvaAndType] || { nb: 0, totalPrice: 0 };
    tvaStats[tvaAndType].nb += sale.quantity;
    tvaStats[tvaAndType].totalPrice += sale.price;

    itemTypesStats[sale.itemType] = itemTypesStats[sale.itemType] || {
      nb: 0,
      totalPrice: 0,
    };
    itemTypesStats[sale.itemType].nb += sale.quantity;
    itemTypesStats[sale.itemType].totalPrice += sale.price;
  }

  const salesByDay = Object.keys(salesByDayStats)
    .sort(function (s1, s2) {
      const d1 = s1.split("/");
      const d2 = s2.split("/");
      return -d1[1].localeCompare(d2[1]) || -d1[0].localeCompare(d2[0]);
    })
    .map((date) => ({
      date,
      count: salesByDayStats[date].nb,
      amount: salesByDayStats[date].totalPrice.toFixed(2),
    }));

  const stats = Object.keys(tvaStats)
    .map((item) => {
      const [tva, typeId] = item.split(",");
      const type = isIn(PAYMENT_METHODS, typeId)
        ? PAYMENT_METHODS[typeId]
        : "Inconnu";
      return [
        tva,
        type,
        tvaStats[item].nb,
        tvaStats[item].totalPrice.toFixed(2),
      ] as const;
    })
    .sort((a, b) => Number(b[0]) - Number(a[0]) || a[1].localeCompare(b[1]));

  const itemTypes = Object.keys(itemTypesStats)
    .map((type) => ({
      type: ITEM_TYPES[type],
      nb: itemTypesStats[type].nb,
      totalPrice: itemTypesStats[type].totalPrice.toFixed(2),
    }))
    .sort((a, b) => b.nb - a.nb);

  return { salesByDay, stats, itemTypes };
};
