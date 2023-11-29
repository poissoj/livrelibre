type Purchase = {
  date: string;
  amount: number;
};

export type DBCustomer = {
  firstname: string;
  lastname: string;
  fullname: string;
  contact: string;
  purchases: Purchase[];
  comment: string;
};

export type Customer = DBCustomer & { _id: string };
