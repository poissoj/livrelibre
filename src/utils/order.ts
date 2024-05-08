import { z } from "zod";

import type { Customer } from "@/utils/customer";
import type { Item } from "@/utils/item";

export const zOrder = z.object({
  date: z.string(),
  customerId: z.string().length(24),
  itemId: z.string().length(24).optional(),
  itemTitle: z.string(),
  ordered: z.enum([
    "new",
    "ordered",
    "received",
    "unavailable",
    "canceled",
    "done",
  ]),
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
  ordered: "Commandé",
  received: "Reçu",
  unavailable: "Indisponible",
  canceled: "Annulé",
  done: "Terminée",
};
