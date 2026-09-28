import type { Customer } from "@livrelibre/shared/customer";

import type { FormResult } from "./form";

export type CustomerFormFields = {
  fullname: string;
  phone: string | null;
  email: string | null;
  contact: string;
  comment: string;
};

export type SelectedCustomer = CustomerFormFields & { id: number };

export type CustomerFormResult = FormResult;

export type { Customer };
