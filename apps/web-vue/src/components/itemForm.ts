import type { BaseItem } from "@livrelibre/shared/item";

export type FormFields = Omit<BaseItem, "amount"> & { amount: string };

export type ItemFormResult = {
  type: "error" | "success" | "warning";
  msg: string;
};
