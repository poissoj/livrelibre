import { Db, MongoClient } from "mongodb";

if (!process.env.MONGODB_URL) {
  throw new Error("MONGOBD_URL is not defined");
}

const DB_NAME = process.env.MONGODB_DB_NAME;
if (!DB_NAME) {
  throw new Error("MONGOBD_DB_NAME is not defined");
}

const client = new MongoClient(process.env.MONGODB_URL);

export const getDb = async (): Promise<Db> => {
  await client.connect();
  return client.db(DB_NAME);
};
