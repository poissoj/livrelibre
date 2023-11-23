/* Usage: ts-node src/cli/importCustomers.ts */
import { parse } from "csv-parse/sync";
import { config } from "dotenv";
import fs from "fs/promises";
import { MongoClient } from "mongodb";

config({ path: ".env.local" });

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  console.error("Please provide MONGODB_URI env var");
  process.exit(1);
}

type Purchase = {
  date: string;
  amount: number;
};

type DBCustomer = {
  firstname: string;
  lastname: string;
  fullname: string;
  contact: string;
  purchases: Purchase[];
  comment: string;
  total: number;
};

type Customer = {
  Nom: string;
  Prénom: string;
  Contact: string;
  date1: string;
  prix1: string;
  date2: string;
  prix2: string;
  date3: string;
  prix3: string;
  date4: string;
  prix4: string;
  date5: string;
  prix5: string;
  date6: string;
  prix6: string;
  date7: string;
  prix7: string;
  date8: string;
  prix8: string;
  Réduction: string;
  Total: string;
  Infos: string;
};

const priceToNumber = (price: string) =>
  Number(price.replace(/€$/, "").replace(",", "."));

let errorCount = 0;

const toDbCustomer = (customer: Customer): DBCustomer => {
  const purchases: Purchase[] = [];
  for (let i = 1 as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; i <= 8; i++) {
    const date = `date${i}` as const;
    const price = `prix${i}` as const;
    if (customer[price]) {
      purchases.push({
        amount: priceToNumber(customer[price]),
        date: customer[date],
      });
    }
  }
  const total = priceToNumber(customer.Total);
  const sum =
    Math.round(purchases.reduce((s, p) => s + p.amount, 0) * 100) / 100;
  if (total !== sum) {
    errorCount++;
    console.error(
      `Invalid total for "${customer.Nom} ${customer.Prénom}"`,
      total,
      sum,
    );
  }
  return {
    firstname: customer.Prénom,
    lastname: customer.Nom,
    fullname: `${customer.Prénom} ${customer.Nom}`,
    contact: customer.Contact,
    comment: customer.Infos,
    purchases,
    total: sum,
  };
};

const main = async () => {
  const client = new MongoClient(MONGODB_URI);
  try {
    const mongoClient = await client.connect();
    const db = mongoClient.db();
    const csvFile = await fs.readFile("./customers.csv", { encoding: "utf-8" });
    const customers = parse(csvFile, { columns: true }) as Customer[];
    console.log(customers.length + " customers found");
    const dbCustomers = customers.map(toDbCustomer);
    console.log(errorCount + " errors");
    const result = await db.collection("customers").insertMany(dbCustomers);
    console.log(`Inserted ${result.insertedCount} documents.`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  } finally {
    void client.close();
  }
};

void main();
