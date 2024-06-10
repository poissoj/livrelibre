import { z } from "zod";

import type { Customer } from "@/utils/customer";
import type { Item } from "@/utils/item";

export const dbIdSchema = z.string().length(24);

export const zOrder = z.object({
  date: z.string(),
  customerId: dbIdSchema,
  itemId: dbIdSchema.optional(),
  itemTitle: z.string(),
  ordered: z.enum(["new", "received", "unavailable", "canceled", "done"]),
  customerNotified: z.boolean(),
  paid: z.boolean(),
  comment: z.string(),
});

export type RawOrder = z.infer<typeof zOrder>;

export type DBOrder = Omit<RawOrder, "date"> & {
  date: Date;
};

export type Order = DBOrder & {
  _id: string;
  customer: Customer;
  item: Item | null;
};

export const deserializeOrder = <T extends { date: string }>(order: T) => ({
  ...order,
  date: new Date(order.date),
});

export const STATUS_LABEL: Record<DBOrder["ordered"], string> = {
  new: "Nouveau",
  received: "Reçu",
  unavailable: "Indisponible",
  canceled: "Annulé",
  done: "Terminée",
};

export const STATUS_COLOR = {
  new: "bg-yellow",
  received: "bg-green",
  unavailable: "bg-blue",
  canceled: "bg-red",
  done: "bg-white",
} as const satisfies Record<DBOrder["ordered"], string>;
