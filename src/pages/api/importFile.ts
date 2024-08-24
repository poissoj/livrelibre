import * as xlsx from "xlsx";
import { inArray } from "drizzle-orm";
import { getIronSession } from "iron-session";
import multer from "multer";
import type { NextApiRequest, NextApiResponse, PageConfig } from "next";
import { createRouter } from "next-connect";

import { db } from "@/db/database";
import { items } from "@/db/schema";
import { type SessionData, sessionOptions } from "@/lib/session";
import type { DilicomRow, DilicomRowWithId } from "@/utils/dilicomItem";
import { getBookData } from "@/utils/getBookData";
import { logger } from "@/utils/logger";

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
  const fileEANs = rows.map((row) => String(row.EAN));
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
        const TITRE = bookData.title || row.TITRE;
        const AUTEUR = bookData.author || row.AUTEUR;
        const EDITEUR = bookData.publisher || row.EDITEUR;
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

const router = createRouter<
  NextApiRequest & { file: Express.Multer.File },
  NextApiResponse
>();

const importFile = router.handler({
  onError(error, _req, res) {
    logger.error(error);
    res.status(500).json({ error: "Server error" });
  },
  onNoMatch(req, res) {
    res
      .status(405)
      .json({ error: `Method '${req.method || "??"}' Not Allowed` });
  },
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.use(
  upload.single("dilicom") as unknown as Parameters<(typeof router)["use"]>[0],
);

router.post(async (req, res) => {
  const { user } = await getIronSession<SessionData>(req, res, sessionOptions);
  if (!user) {
    res.status(401).json({ error: "Unauthenticated" });
    return;
  }
  logger.info("import file", { filename: req.file.originalname, user });
  let rows: DilicomRow[] = [];
  try {
    rows = filterRows(fileToJson(req.file.buffer));
  } catch (error) {
    logger.error(error);
    res.status(400).json({
      error:
        "Erreur lors de l'import du fichier. Vérifier que le format est correct.",
    });
    return;
  }
  try {
    const items = await updateFields(rows);
    res.json(items);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Erreur lors du traitement du fichier" });
  }
});

export default importFile;

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
