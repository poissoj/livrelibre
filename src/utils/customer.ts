type Purchase = {
  date: string;
  amount: number;
};

export type DBCustomer = {
  name: string;
  firstname: string;
  contact: string;
  purchases: Purchase[];
  comment: string;
  total: number;
};
