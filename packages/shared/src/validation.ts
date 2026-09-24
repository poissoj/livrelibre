import { z } from "zod";

export const zId = z.number().int().positive();

export const zPage = z.number().int().min(1);

export const zAmount = z.number().int().nonnegative();

export const zQuantity = z.number().int().positive();

/** Price as a string, normalized to a dot and bounded to numeric(12,2). */
export const zPrice = z
  .string()
  .trim()
  .regex(/^\d{1,10}([.,]\d{1,2})?$/, "Prix invalide")
  .transform((value) => value.replace(",", "."));

export const zIsbn = z
  .string()
  .trim()
  .regex(/^\d{0,13}$/, "ISBN invalide");

export const zDateISO = z.iso.date();

export const zDateFR = z
  .string()
  .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Date invalide")
  .refine((value) => {
    const [day, month, year] = value.split("/").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  }, "Date invalide");

/** Accepts a date-only string or an ISO datetime string. */
export const zDateString = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Date invalide");
