type Purchase = {
  date: string;
  amount: number;
};

export type DBCustomer = {
  fullname: string;
  contact: string;
  purchases: Purchase[];
  comment: string;
};

export type Customer = DBCustomer & { _id: string };
