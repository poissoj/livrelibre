import { z } from "zod";

import { ERROR_CODES } from "./errors";
import { DEFAULT_LOYALTY_DISCOUNT_PERCENT } from "./sale";

/** Réglages de l'application (taux de remise fidélité, etc.). */
export type Settings = {
  loyaltyDiscountPercent: number;
};

export const DEFAULT_SETTINGS: Settings = {
  loyaltyDiscountPercent: DEFAULT_LOYALTY_DISCOUNT_PERCENT,
};

/** Taux de remise fidélité : pourcentage entre 0 et 100, deux décimales max. */
export const zLoyaltyDiscountPercent = z
  .number(ERROR_CODES.INVALID_DISCOUNT_PERCENT)
  .min(0, ERROR_CODES.INVALID_DISCOUNT_PERCENT)
  .max(100, ERROR_CODES.INVALID_DISCOUNT_PERCENT)
  .multipleOf(0.01, ERROR_CODES.INVALID_DISCOUNT_PERCENT);

export const zSettings = z.object({
  loyaltyDiscountPercent: zLoyaltyDiscountPercent,
});
