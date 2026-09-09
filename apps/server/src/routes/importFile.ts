import * as xlsx from "xlsx";
import { inArray } from "drizzle-orm";
import type { Context } from "hono";

import {
  type DilicomRow,
  type DilicomRowWithId,
} from "@livrelibre/shared/dilicomItem";
import { items } from "@livrelibre/shared/schema";

import { type User } from "@server/auth";
import { db } from "@server/db/database";
import { getBookData } from "@server/utils/getBookData";
import { logger } from "@server/utils/logger";

const header = [
  "EAN",
  "TITRE",
  "AUTEUR",
  "EDITEUR",
  "DISTRIBUTEUR",
  "PRIX",
  "DISPO",
  "REF.LIGNE",
  "QTE",
  "TOTAL",
];

const fileToJson = (data: Buffer) => {
  // Need raw: true because in a CSV file, prices like "12,00" are parsed as 1200
  const workbook = xlsx.read(data, { raw: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json = xlsx.utils.sheet_to_json<DilicomRow>(sheet, { header });
  return json;
};

const parseValue = (value: string | number) => {
  if (typeof value === "number") return value;
  return Number(value.replace(",", "."));
};

const filterRows = (json: DilicomRow[]) => {
  const rows: DilicomRow[] = [];
  let headerRowFound = false;
  for (const row of json) {
    if (row.EAN === "EAN" && row.TITRE === "TITRE") {
      headerRowFound = true;
      continue;
    }
    if (headerRowFound && row.EAN) {
      rows.push({
        ...row,
        PRIX: parseValue(row.PRIX),
        QTE: parseValue(row.QTE),
        TOTAL: parseValue(row.TOTAL),
      });
    }
  }
  return rows;
};

const updateFields = async (rows: DilicomRow[]) => {
  const fileEANs = rows.map((row) => row.EAN);
  const dbItems = await db
    .select()
    .from(items)
    .where(inArray(items.isbn, fileEANs));

  const itemsList: DilicomRowWithId[] = [];
  for (const row of rows) {
    const item = dbItems.find((it) => it.isbn === row.EAN);
    let newRow: DilicomRowWithId;
    if (item) {
      newRow = {
        ...row,
        AUTEUR: item.author,
        TITRE: item.title,
        EDITEUR: item.publisher,
        DISTRIBUTEUR: item.distributor,
        id: item.id,
        amount: item.amount,
      };
    } else {
      logger.info("Import - Fetch book data", { isbn: row.EAN });
      try {
        const bookData = await getBookData(row.EAN);
        logger.info("Import - Got book data", { isbn: row.EAN, bookData });
        const TITRE = bookData?.title || row.TITRE;
        const AUTEUR = bookData?.author || row.AUTEUR;
        const EDITEUR = bookData?.publisher || row.EDITEUR;
        newRow = { ...row, TITRE, AUTEUR, EDITEUR, id: null, amount: null };
      } catch (error) {
        logger.error(error);
        newRow = { ...row, id: null, amount: null };
      }
    }
    itemsList.push(newRow);
  }

  return itemsList;
};

export const importFileRoute = async (c: Context) => {
  const user = c.get("user") as User;
  if (user.role === "anonymous") {
    return c.json({ error: "Unauthenticated" }, 401);
  }
  const body = await c.req.parseBody();
  const file = body["dilicom"];
  if (!(file instanceof File)) {
    return c.json({ error: "No file provided" }, 400);
  }
  logger.info("import file", { filename: file.name, user });
  const buffer = Buffer.from(await file.arrayBuffer());
  let rows: DilicomRow[] = [];
  try {
    rows = filterRows(fileToJson(buffer));
  } catch (error) {
    logger.error(error);
    return c.json(
      {
        error:
          "Erreur lors de l'import du fichier. Vérifier que le format est correct.",
      },
      400,
    );
  }
  try {
    const itemsList = await updateFields(rows);
    return c.json(itemsList);
  } catch (error) {
    logger.error(error);
    return c.json({ error: "Erreur lors du traitement du fichier" }, 500);
  }
};
