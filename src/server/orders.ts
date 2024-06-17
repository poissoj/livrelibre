import { ObjectId } from "mongodb";
import { z } from "zod";

import { getDb } from "@/server/database";
import type { DBCustomer } from "@/utils/customer";
import type { DBItem } from "@/utils/item";
import { logger } from "@/utils/logger";
import {
  type DBOrder,
  type Order,
  type OrderStatus,
  type RawOrder,
  dbIdSchema,
  deserializeOrder,
} from "@/utils/order";

export const getOrder = async (id: string) => {
  const db = await getDb();
  const dbOrder = await db
    .collection<DBOrder>("orders")
    .findOne({ _id: new ObjectId(id) });
  if (dbOrder) {
    const customer = await db.collection<DBCustomer>("customers").findOne({
      _id: new ObjectId(dbOrder.customerId),
    });
    if (!customer) {
      throw new Error("Invalid customerId");
    }
    const item = dbOrder.itemId
      ? await db.collection<DBItem>("books").findOne({
          _id: new ObjectId(dbOrder.itemId),
        })
      : null;
    return { ...dbOrder, customer, item };
  }
  return null;
};

export const getItemOrders = async (itemId: string) => {
  const db = await getDb();
  const items = await db
    .collection<DBOrder>("orders")
    .aggregate<{ _id: DBOrder["ordered"]; count: number }>([
      {
        $match: { itemId, ordered: { $nin: ["done"] } },
      },
      {
        $group: { _id: "$ordered", count: { $sum: 1 } },
      },
    ])
    .toArray();
  return items;
};

export const getOrders = async (status: OrderStatus[]): Promise<Order[]> => {
  const db = await getDb();
  const ordersCollection = db.collection<DBOrder>("orders");
  const dbItems = await ordersCollection
    .aggregate<Order>([
      {
        $match: { ordered: { $in: status } },
      },
      {
        $addFields: {
          customerId: { $toObjectId: "$customerId" },
          itemId: { $toObjectId: "$itemId" },
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
        $lookup: {
          from: "books",
          localField: "itemId",
          foreignField: "_id",
          as: "item",
        },
      },
      {
        $unwind: {
          path: "$customer",
        },
      },
      { $unwind: { path: "$item", preserveNullAndEmptyArrays: true } },
    ])
    .toArray();
  return dbItems;
};

export const getCustomerActiveOrders = async (customerId: string) => {
  const db = await getDb();
  const orders = await db
    .collection<DBOrder>("orders")
    .find({ customerId, ordered: { $nin: ["done"] } })
    .toArray();
  return orders;
};

export const zInputOrder = z.object({
  customerId: dbIdSchema,
  itemId: z.string().optional(),
  itemTitle: z.string(),
  comment: z.string(),
});

type InputOrder = z.infer<typeof zInputOrder>;

export const newOrder = async (order: InputOrder) => {
  const db = await getDb();
  const newOrder: DBOrder = {
    ...order,
    date: new Date(),
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
    if (order.itemId?.length === 24) {
      const item = await db
        .collection<DBItem>("books")
        .findOne({ _id: new ObjectId(order.itemId) });
      if (item == null) {
        return { type: "error" as const, msg: "Article invalide" };
      }
    } else {
      newOrder.itemId = undefined;
    }
    await db.collection<DBOrder>("orders").insertOne(newOrder);
    return { type: "success" as const, msg: "La commande a été ajoutée" };
  } catch (error) {
    logger.error(error);
    return { type: "error" as const, msg: "Impossible d'ajouter la commande" };
  }
};

export const setOrder = async (order: RawOrder, id: string) => {
  const db = await getDb();
  try {
    await db
      .collection<DBOrder>("orders")
      .findOneAndReplace({ _id: new ObjectId(id) }, deserializeOrder(order));
    return { type: "success" as const, msg: "La commande a été modifiée" };
  } catch (error) {
    logger.error(error);
    return {
      type: "error" as const,
      msg: "Impossible de modifier la commande",
    };
  }
};

export const deleteOrder = async (orderId: string) => {
  const db = await getDb();
  try {
    await db
      .collection<DBOrder>("orders")
      .deleteOne({ _id: new ObjectId(orderId) });
    return { type: "success" as const, msg: "La commande a été supprimée" };
  } catch (error) {
    logger.error(error);
    return {
      type: "error" as const,
      msg: "Impossible de supprimer la commande",
    };
  }
};
