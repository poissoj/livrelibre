import { z } from "zod";

import { ERROR_CODES } from "./errors";
import type { customers } from "./schema";

export const zCustomer = z.object({
  fullname: z.string().trim().min(1, ERROR_CODES.INVALID_NAME),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  contact: z.string(),
  comment: z.string(),
});

export type CustomerInput = z.infer<typeof zCustomer>;

type Purchase = {
  date: string;
  amount: number;
};

export type Customer = typeof customers.$inferSelect;

export type CustomerWithPurchase = Customer & {
  purchases: Purchase[];
};

export type CustomerWithTotal = Customer & { total: string | null };
