export const PAYMENT_METHODS = {
  cash: "Espèces",
  card: "Carte bleue",
  check: "Chèque",
  "check-lire": "Chèque lire",
  transfer: "Virement",
} as const;

export type PaymentType = keyof typeof PAYMENT_METHODS;
