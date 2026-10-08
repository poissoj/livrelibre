export const PAYMENT_METHODS = {
  cash: "Espèces",
  card: "Carte bleue",
  check: "Chèque",
  "check-lire": "Chèque lire",
  transfer: "Virement",
} as const;

export type PaymentType = keyof typeof PAYMENT_METHODS;

export const LOYALTY_DISCOUNT_TITLE = "Remise carte de fidélité";

export const LOYALTY_DISCOUNT_PERCENT = 3;

/** Loyalty discount in euros, rounded to the cent, for a given purchase total. */
export const loyaltyDiscount = (total: number): number =>
  Math.round(total * LOYALTY_DISCOUNT_PERCENT) / 100;

export const CART_ITEM_KINDS = ["standalone", "loyaltyDiscount"] as const;
export type CartItemKind = (typeof CART_ITEM_KINDS)[number];
