import type { BookData } from "@livrelibre/server/utils/getBookData";
import type { DilicomRowWithId } from "@livrelibre/shared/dilicomItem";

import type { RouterOutput } from "./trpc";

export const isBookData = (value: unknown): value is BookData =>
  typeof value === "object" &&
  value !== null &&
  "title" in value &&
  typeof value.title === "string" &&
  "author" in value &&
  typeof value.author === "string" &&
  "publisher" in value &&
  typeof value.publisher === "string";

export const isUser = (value: unknown): value is RouterOutput["user"] =>
  typeof value === "object" &&
  value !== null &&
  "id" in value &&
  typeof value.id === "number" &&
  "name" in value &&
  typeof value.name === "string" &&
  "role" in value &&
  (value.role === "admin" || value.role === "cashier" || value.role === "anonymous");

export const isDilicomRows = (value: unknown): value is DilicomRowWithId[] => {
  if (!Array.isArray(value)) return false;
  const rows: unknown[] = value;
  return rows.every(
    (row) =>
      typeof row === "object" &&
      row !== null &&
      "EAN" in row &&
      typeof row.EAN === "string" &&
      "QTE" in row &&
      typeof row.QTE === "number",
  );
};
