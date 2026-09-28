import type { Customer } from "@livrelibre/shared/customer";
import type { Item } from "@livrelibre/shared/item";
import type { RawOrder } from "@livrelibre/shared/order";

import type { FormResult } from "./form";

export type CustomerSelection = Pick<
  Customer,
  "id" | "fullname" | "phone" | "email" | "contact" | "comment"
>;

export type OrderFormData = Partial<Omit<RawOrder, "created">> & {
  created: Date;
  customer?: Customer | null;
  item?: Item | null;
};

export type OrderFormResult = FormResult;
