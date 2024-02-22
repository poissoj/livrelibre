import type { Customer } from "@/utils/customer";

export type DBOrder = {
  date: Date;
  customerId: string;
  itemTitle: string;
  isbn: string | undefined;
  ordered: "new" | "ordered" | "received" | "unavailable";
  customerNotified: boolean;
  paid: boolean;
  comment: string;
};

export type Order = Omit<DBOrder, "customerId"> & {
  _id: string;
  customer: Customer;
};
