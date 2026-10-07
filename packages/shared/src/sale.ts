export const PAYMENT_METHODS = {
  cash: "Espèces",
  card: "Carte bleue",
  check: "Chèque",
  "check-lire": "Chèque lire",
  transfer: "Virement",
} as const;

export type PaymentType = keyof typeof PAYMENT_METHODS;

export const LOYALTY_DISCOUNT_TITLE = "Remise carte de fidélité";

export const CART_ITEM_KINDS = ["standalone", "loyaltyDiscount"] as const;
export type CartItemKind = (typeof CART_ITEM_KINDS)[number];
