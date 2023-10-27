/* Usage: ts-node src/cli/exportPlaceDesLibraires.ts
 * run 1/day with cron
 */
import { Client } from "basic-ftp";
import { config } from "dotenv";
import fs from "fs/promises";
import { MongoClient } from "mongodb";

config({ path: ".env.local" });

const { MONGODB_URI, SHOP_ID } = process.env;

if (!SHOP_ID) {
  console.error("Please provide SHOP_ID env var");
  process.exit(1);
}
if (!MONGODB_URI) {
  console.error("Please provide MONGODB_URI env var");
  process.exit(1);
}

const FILENAME = `${SHOP_ID}_ART.asc`;

type DBItem = {
  amount: number;
  isbn: string;
  price: string;
};

const formatItem = (item: DBItem) => {
  const isbn = item.isbn.padStart(13, "0");
  const amount = String(item.amount).padStart(4, "0");
  const price = String(Math.round(Number(item.price) * 100)).padStart(10, "0");
  return `${SHOP_ID}${isbn}${amount}${price}`;
};

const date = new Date().toLocaleDateString("fr-FR");
const header = `EXTRACTION STOCK DU ${date}`;

const sendToFtp = async () => {
  const { FTP_HOST, FTP_USER, FTP_PASSWORD } = process.env;
  if (!FTP_HOST || !FTP_USER || !FTP_PASSWORD) {
    console.info(
      "Env var FTP_HOST, FTP_USER or FTP_PASSWORD is missing, skip ftp send",
    );
    return;
  }
  const client = new Client();
  try {
    await client.access({
      host: FTP_HOST,
      user: FTP_USER,
      password: FTP_PASSWORD,
    });
    await client.uploadFrom(FILENAME, FILENAME);
    console.log("File sent to ftp server.");
  } catch (error) {
    console.error(error);
  }
  client.close();
};

const main = async () => {
  const client = new MongoClient(MONGODB_URI);
  try {
    const mongoClient = await client.connect();
    const db = mongoClient.db();
    const items = await db
      .collection<DBItem>("books")
      .find({ amount: { $gt: 0 }, isbn: /^\d{10,13}$/ })
      .toArray();
    const fileContent = [header, ...items.map(formatItem)].join("\r\n");
    await fs.writeFile(FILENAME, fileContent);
    console.log(`Exported ${items.length} items successfully.`);
    await sendToFtp();
  } catch (error) {
    console.log(error);
    process.exit(1);
  } finally {
    void client.close();
  }
};

void main();
