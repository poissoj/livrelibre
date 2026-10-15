export const PAYMENT_METHODS = {
  cash: "Espèces",
  card: "Carte bleue",
  check: "Chèque",
  "check-lire": "Chèque lire",
  transfer: "Virement",
} as const;

export type PaymentType = keyof typeof PAYMENT_METHODS;

export const LOYALTY_DISCOUNT_TITLE = "Remise carte de fidélité";

/** Taux de remise fidélité par défaut, en pourcentage (modifiable dans les réglages). */
export const DEFAULT_LOYALTY_DISCOUNT_PERCENT = 3;

/**
 * Loyalty discount in euros, rounded to the cent, for a given purchase total
 * and percentage rate.
 */
export const loyaltyDiscount = (total: number, percent: number): number =>
  Math.round(total * percent) / 100;

export const CART_ITEM_KINDS = ["standalone", "loyaltyDiscount"] as const;
export type CartItemKind = (typeof CART_ITEM_KINDS)[number];
