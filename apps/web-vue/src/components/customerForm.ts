import type { Customer } from "@livrelibre/shared/customer";

export type CustomerFormFields = {
  fullname: string;
  phone: string | null;
  email: string | null;
  contact: string;
  comment: string;
};

export type SelectedCustomer = CustomerFormFields & { id: number };

export type CustomerFormResult = {
  type: "error" | "success";
  msg: string;
};

export type { Customer };
