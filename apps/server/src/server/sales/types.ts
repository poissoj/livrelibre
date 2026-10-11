import type { DBItem, TVA } from "@livrelibre/shared/item";
import type { PaymentType } from "@livrelibre/shared/sale";
import type { sales } from "@livrelibre/shared/schema";

export type AggregatedSale = Pick<
  typeof sales.$inferSelect,
  "receiptId" | "id" | "title" | "tva" | "paymentType" | "quantity" | "deleted" | "linkedToCustomer"
> & { price: number };

export type ItemSale = Omit<DBItem, "price" | "type"> & {
  itemId: number;
  price: number;
  paymentType: PaymentType;
  quantity: number;
  deleted: boolean;
  id: number;
  linkedToCustomer: boolean | undefined;
};

export type UnlistedSale = Omit<AggregatedSale, "paymentType" | "id" | "receiptId"> & {
  paymentType: PaymentType;
  itemId: null;
  deleted: boolean;
  id: number;
  receiptId: number | null;
};

export type Sale = ItemSale | UnlistedSale;

/** Raw row selected from the `sales` table, before resolving the item. */
export type DbSale = {
  id: number;
  itemId: number | null;
  receiptId: number;
  price: number;
  title: string | null;
  tva: TVA;
  paymentType: PaymentType;
  quantity: number;
  deleted: boolean;
  linkedToCustomer: boolean;
};
