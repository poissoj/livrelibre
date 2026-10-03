import { z } from "zod";

const INT4_MAX = 2_147_483_647;

export const dilicomRowSchema = z.object({
  EAN: z.string().trim().min(1).max(13),
  TITRE: z.string().catch(""),
  AUTEUR: z.string().catch(""),
  EDITEUR: z.string().catch(""),
  DISTRIBUTEUR: z.string().catch(""),
  PRIX: z.number().nonnegative(),
  QTE: z.number().int().nonnegative().max(INT4_MAX),
  DISPO: z.string().optional(),
  "REF.LIGNE": z.string().optional(),
  TOTAL: z.number().optional(),
});

export const dilicomRowWithIdSchema = dilicomRowSchema.extend({
  id: z.number().int().positive().nullable().optional(),
  amount: z.number().int().nullable().optional(),
});

export const MAX_IMPORT_ROWS = 1000;

export const importPayloadSchema = z
  .array(dilicomRowWithIdSchema)
  .min(1)
  .max(MAX_IMPORT_ROWS);

export type DilicomRow = z.infer<typeof dilicomRowSchema>;

export type DilicomRowWithId = z.infer<typeof dilicomRowWithIdSchema>;

/**
 * Merges rows sharing the same EAN by summing their quantities. The first
 * occurrence wins for the other fields. Prevents duplicate EANs from breaking
 * an import (unique index violation) or from being counted twice.
 */
export const mergeRowsByEan = <T extends { EAN: string; QTE: number }>(
  rows: T[],
): T[] => {
  const byEan = new Map<string, T>();
  for (const row of rows) {
    const ean = row.EAN.trim();
    const existing = byEan.get(ean);
    if (existing) {
      byEan.set(ean, { ...existing, QTE: existing.QTE + row.QTE });
    } else {
      byEan.set(ean, { ...row, EAN: ean });
    }
  }
  return [...byEan.values()];
};
