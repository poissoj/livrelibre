import type { ObjectId } from "mongodb";

import type { ItemType, TVA } from "@/utils/item";

export const PAYMENT_METHODS = {
  cash: "Espèces",
  card: "Carte bleue",
  check: "Chèque",
  "check-lire": "Chèque lire",
  transfer: "Virement",
} as const;

export type PaymentType = keyof typeof PAYMENT_METHODS;

export type DBSale = {
  cartId?: ObjectId;
  date: string;
  id: string | undefined;
  itemType: ItemType;
  price: number;
  quantity: number;
  title?: string;
  tva?: TVA;
  type?: PaymentType;
  deleted?: boolean;
  linkedToCustomer?: boolean;
};
