type Purchase = {
  date: string;
  amount: number;
};

export type DBCustomer = {
  fullname: string;
  nmFullname: string;
  contact: string;
  phone?: string | undefined;
  email?: string | undefined;
  purchases: Purchase[];
  comment: string;
};

export type Customer = DBCustomer & { _id: string };
