import { z } from "zod";

import { ERROR_CODES } from "./errors";

export const zId = z
  .number(ERROR_CODES.INVALID_ID)
  .int(ERROR_CODES.INVALID_ID)
  .positive(ERROR_CODES.INVALID_ID);

export const zPage = z
  .number(ERROR_CODES.INVALID_PAGE)
  .int(ERROR_CODES.INVALID_PAGE)
  .min(1, ERROR_CODES.INVALID_PAGE);

export const zAmount = z
  .number(ERROR_CODES.INVALID_QUANTITY)
  .int(ERROR_CODES.INVALID_QUANTITY)
  .nonnegative(ERROR_CODES.INVALID_QUANTITY);

export const zQuantity = z
  .number(ERROR_CODES.INVALID_QUANTITY)
  .int(ERROR_CODES.INVALID_QUANTITY)
  .positive(ERROR_CODES.INVALID_QUANTITY);

/** Signed price as a string, normalized to a dot and bounded to numeric(12,2). */
export const zPrice = z
  .string(ERROR_CODES.INVALID_PRICE)
  .trim()
  .regex(/^-?\d{1,10}([.,]\d{1,2})?$/, ERROR_CODES.INVALID_PRICE)
  .transform((value) => value.replace(",", "."));

/** Non-negative amount as a string, normalized to a dot (e.g. cash payment). */
export const zPositivePrice = z
  .string(ERROR_CODES.INVALID_AMOUNT)
  .trim()
  .regex(/^\d{1,10}([.,]\d{1,2})?$/, ERROR_CODES.INVALID_AMOUNT)
  .transform((value) => value.replace(",", "."));

export const zIsbn = z
  .string(ERROR_CODES.INVALID_ISBN)
  .trim()
  .regex(/^\d{0,13}$/, ERROR_CODES.INVALID_ISBN);

export const zDateISO = z.iso.date(ERROR_CODES.INVALID_DATE);

/** Accepts a date-only string or an ISO datetime string. */
export const zDateString = z
  .string(ERROR_CODES.INVALID_DATE)
  .refine((value) => !Number.isNaN(Date.parse(value)), ERROR_CODES.INVALID_DATE);
