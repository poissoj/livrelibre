import { z } from "zod";

export const zId = z
  .number("Identifiant invalide")
  .int("Identifiant invalide")
  .positive("Identifiant invalide");

export const zPage = z
  .number("Numéro de page invalide")
  .int("Numéro de page invalide")
  .min(1, "Numéro de page invalide");

export const zAmount = z
  .number("Quantité invalide")
  .int("Quantité invalide")
  .nonnegative("Quantité invalide");

export const zQuantity = z
  .number("Quantité invalide")
  .int("Quantité invalide")
  .positive("Quantité invalide");

/** Price as a string, normalized to a dot and bounded to numeric(12,2). */
export const zPrice = z
  .string("Prix invalide")
  .trim()
  .regex(/^\d{1,10}([.,]\d{1,2})?$/, "Prix invalide")
  .transform((value) => value.replace(",", "."));

export const zIsbn = z
  .string("ISBN invalide")
  .trim()
  .regex(/^\d{0,13}$/, "ISBN invalide");

export const zDateISO = z.iso.date("Date invalide");

export const zDateFR = z
  .string("Date invalide")
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
  .string("Date invalide")
  .refine((value) => !Number.isNaN(Date.parse(value)), "Date invalide");
