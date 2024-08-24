import { z } from "zod";

import type { orders } from "@/db/schema";

export const dbIdSchema = z.string().length(24);

export const ORDER_STATUS = [
  "new",
  "received",
  "unavailable",
  "canceled",
  "done",
  "other",
] as const;

export type OrderStatus = (typeof ORDER_STATUS)[number];

export const zOrderStatus = z.enum(ORDER_STATUS);
export const zOrderStatusArray = z.array(zOrderStatus);

export const zOrder = z.object({
  created: z.string(),
  customerId: z.number().nullable(),
  itemId: z.number().nullable(),
  itemTitle: z.string(),
  ordered: zOrderStatus,
  customerNotified: z.boolean(),
  paid: z.boolean(),
  comment: z.string(),
  nb: z.number().positive(),
});

export type RawOrder = z.infer<typeof zOrder>;

export type DBOrder = Omit<RawOrder, "date"> & {
  date: Date;
};

export type OrderRow = typeof orders.$inferSelect & {
  customerName: string;
  isbn: string | null;
  distributor: string | null;
};

export const deserializeOrder = <T extends { created: string }>(order: T) => ({
  ...order,
  created: new Date(order.created),
});

export const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "En cours",
  received: "Reçu",
  unavailable: "Indisponible",
  canceled: "Annulé",
  other: "Autre",
  done: "Terminée",
};

export const STATUS_COLOR = {
  new: "bg-yellow",
  received: "bg-green",
  unavailable: "bg-blue",
  canceled: "bg-red",
  other: "bg-purple",
  done: "bg-white",
} as const satisfies Record<OrderStatus, string>;
