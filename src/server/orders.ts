import { ObjectId } from "mongodb";
import { z } from "zod";

import { getDb } from "@/server/database";
import type { DBCustomer } from "@/utils/customer";
import { logger } from "@/utils/logger";
import type { DBOrder, Order } from "@/utils/order";

export const getOrders = async (): Promise<Order[]> => {
  const db = await getDb();
  const ordersCollection = db.collection<DBOrder>("orders");
  const dbItems = await ordersCollection
    .aggregate<Order>([
      {
        $addFields: {
          customerId: { $toObjectId: "$customerId" },
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      {
        $unwind: {
          path: "$customer",
        },
      },
    ])
    .toArray();
  return dbItems;
};

export const zOrder = z.object({
  customerId: z.string().length(24),
  comment: z.string(),
  isbn: z.string().optional(),
});

type InputOrder = z.infer<typeof zOrder>;

export const newOrder = async (order: InputOrder) => {
  const db = await getDb();
  const newOrder: DBOrder = {
    ...order,
    isbn: order.isbn,
    date: new Date(),
    itemTitle: "",
    ordered: "new",
    customerNotified: false,
    paid: false,
  };
  try {
    const customer = await db
      .collection<DBCustomer>("customers")
      .findOne({ _id: new ObjectId(order.customerId) });
    if (customer == null) {
      return { type: "error" as const, msg: "Client inconnu" };
    }
    await db.collection<DBOrder>("orders").insertOne(newOrder);
    return { type: "success" as const, msg: "La commande a été ajoutée" };
  } catch (error) {
    logger.error(error);
    return { type: "error" as const, msg: "Impossible d'ajouter la commande" };
  }
};
