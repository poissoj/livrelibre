import type { customers } from "./schema";

type Purchase = {
  date: string;
  amount: number;
};

export type Customer = typeof customers.$inferSelect;

export type CustomerWithPurchase = Customer & {
  purchases: Purchase[];
};

export type CustomerWithTotal = Customer & { total: string | null };
