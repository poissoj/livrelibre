/* Usage: ts-node src/cli/exportPlaceDesLibraires.ts
 * run 1/day with cron
 */
import { Client } from "basic-ftp";
import { config } from "dotenv";
import { and, sql } from "drizzle-orm";
import fs from "fs/promises";

import { db } from "@/db/database";
import { items as itemsTable } from "@/db/schema";

config({ path: ".env.local" });

const { SHOP_ID } = process.env;

if (!SHOP_ID) {
  console.error("Please provide SHOP_ID env var");
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
  try {
    const items = await db.query.items.findMany({
      columns: {
        amount: true,
        isbn: true,
        price: true,
      },
      where: and(
        sql`${itemsTable.amount} > 0`,
        sql`${itemsTable.isbn} ~ '^\\d{10,13}$'`,
      ),
      orderBy: itemsTable.id, // TODO: remove
    });
    const fileContent = [header, ...items.map(formatItem)].join("\r\n");
    await fs.writeFile(FILENAME, fileContent);
    console.log(`Exported ${items.length} items successfully.`);
    await sendToFtp();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

void main();
