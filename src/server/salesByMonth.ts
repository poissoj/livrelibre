import { getDb } from "@/server/database";
import { ITEM_TYPES, ItemType, TVA } from "@/utils/item";
import { PAYMENT_METHODS, PaymentType } from "@/utils/sale";
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
  const salesByDayStats = new Map<string, Stat>();
  const tvaStats = new Map<string, Stat>();
  const itemTypesStats: Partial<Record<ItemType, Stat>> = {};

  for (const sale of sales) {
    let salesByDayStat = salesByDayStats.get(sale.date);
    if (!salesByDayStat) {
      salesByDayStat = { nb: 0, totalPrice: 0 };
      salesByDayStats.set(sale.date, salesByDayStat);
    }
    salesByDayStat.nb += sale.quantity;
    salesByDayStat.totalPrice += sale.price;

    const tvaAndType = [sale.tva || "Inconnu", sale.type].join();
    let tvaStat = tvaStats.get(tvaAndType);
    if (!tvaStat) {
      tvaStat = { nb: 0, totalPrice: 0 };
      tvaStats.set(tvaAndType, tvaStat);
    }
    tvaStat.nb += sale.quantity;
    tvaStat.totalPrice += sale.price;

    const stat = itemTypesStats[sale.itemType] || {
      nb: 0,
      totalPrice: 0,
    };
    stat.nb += sale.quantity;
    stat.totalPrice += sale.price;
    itemTypesStats[sale.itemType] = stat;
  }

  const salesByDay = [...salesByDayStats.entries()]
    .sort(function (s1, s2) {
      const d1 = s1[0].split("/");
      const d2 = s2[0].split("/");
      return -d1[1].localeCompare(d2[1]) || -d1[0].localeCompare(d2[0]);
    })
    .map(([date, salesByDayStat]) => ({
      date,
      count: salesByDayStat.nb,
      amount: salesByDayStat.totalPrice.toFixed(2),
    }));

  const stats = [...tvaStats.entries()]
    .map(([item, tvaStat]) => {
      const [tva, typeId] = item.split(",");
      const type = isIn(PAYMENT_METHODS, typeId)
        ? PAYMENT_METHODS[typeId]
        : "Inconnu";
      return {
        tva,
        type,
        nb: tvaStat.nb,
        totalPrice: tvaStat.totalPrice.toFixed(2),
      } as const;
    })
    .sort(
      (a, b) => Number(b.tva) - Number(a.tva) || a.type.localeCompare(b.type)
    );

  const itemTypes = Object.entries(itemTypesStats)
    .map(([type, stat]) => ({
      type: ITEM_TYPES[type as ItemType],
      nb: stat.nb,
      totalPrice: stat.totalPrice.toFixed(2),
    }))
    .sort((a, b) => b.nb - a.nb);

  return { salesByDay, stats, itemTypes };
};
