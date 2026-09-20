import { z } from "zod";

export const dilicomRowSchema = z.object({
  EAN: z.string().trim().min(1).max(13),
  TITRE: z.string().catch(""),
  AUTEUR: z.string().catch(""),
  EDITEUR: z.string().catch(""),
  DISTRIBUTEUR: z.string().catch(""),
  PRIX: z.number().nonnegative(),
  QTE: z.number().int().nonnegative(),
  DISPO: z.string().optional(),
  "REF.LIGNE": z.string().optional(),
  TOTAL: z.number().optional(),
});

export const dilicomRowWithIdSchema = dilicomRowSchema.extend({
  id: z.number().int().positive().nullable().optional(),
  amount: z.number().int().nullable().optional(),
});

export const MAX_IMPORT_ROWS = 10000;

export const importPayloadSchema = z
  .array(dilicomRowWithIdSchema)
  .min(1)
  .max(MAX_IMPORT_ROWS);

export type DilicomRow = z.infer<typeof dilicomRowSchema>;

export type DilicomRowWithId = z.infer<typeof dilicomRowWithIdSchema>;
