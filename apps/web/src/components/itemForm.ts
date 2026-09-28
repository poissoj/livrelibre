import type { BaseItem } from "@livrelibre/shared/item";

import type { FormResult } from "./form";

export type FormFields = Omit<BaseItem, "amount"> & { amount: string };

export type ItemFormResult = FormResult<"error" | "success" | "warning">;
