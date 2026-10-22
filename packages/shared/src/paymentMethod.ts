import { z } from "zod";

import { ERROR_CODES } from "./errors";

/**
 * Moyens de paiement par défaut. Ils servent à amorcer la table
 * `paymentMethods` ; l'administrateur peut ensuite les modifier dans les
 * réglages.
 */
export const INITIAL_PAYMENT_METHODS = {
  cash: "Espèces",
  card: "Carte bleue",
  check: "Chèque",
  "check-lire": "Chèque lire",
  transfer: "Virement",
} as const;

/** Code stable stocké dans `sales.paymentType`. */
export type PaymentMethodCode = string;

/** Moyen de paiement proposé par défaut dans le panier. */
export const DEFAULT_PAYMENT_METHOD_CODE = "cash";

/**
 * Code réservé au paiement en espèces. Il pilote l'affichage du montant reçu
 * dans le panier et le calcul du rendu de monnaie. Le libellé peut être
 * modifié, mais ce code ne doit pas être supprimé puis recréé sous un autre
 * code si le commerce encaisse des espèces.
 */
export const CASH_PAYMENT_METHOD_CODE = "cash";

export const zPaymentMethodCode = z
  .string(ERROR_CODES.INVALID_PAYMENT_METHOD)
  .trim()
  .min(1, ERROR_CODES.INVALID_PAYMENT_METHOD);
