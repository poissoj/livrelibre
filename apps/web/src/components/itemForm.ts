import { ERROR_CODES } from "@livrelibre/shared/errors";
import type { BaseItem } from "@livrelibre/shared/item";
import { zItem } from "@livrelibre/shared/item";
import { z } from "zod";

import type { FormResult } from "./form";

export type FormFields = Omit<BaseItem, "amount"> & { amount: string };

/** Form-level schema: `amount` is edited as a string but must be a non-negative integer. */
export const zItemForm = zItem.extend({
  amount: z.string().trim().regex(/^\d+$/, ERROR_CODES.INVALID_QUANTITY).transform(Number),
});

export type ItemFormResult = FormResult<"error" | "success" | "warning">;
