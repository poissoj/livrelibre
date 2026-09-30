export type CartError = "ITEM_NOT_FOUND" | "NO_STOCK" | "INTERNAL_ERROR";

/**
 * Stable error identifiers exchanged with the API. The server emits these
 * (English, machine-oriented); the client owns the user-facing French copy.
 */
export const ERROR_CODES = {
  // tRPC structural codes
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  // Business errors (tRPC)
  CUSTOMER_NOT_FOUND: "CUSTOMER_NOT_FOUND",
  CUSTOMER_HAS_ORDERS: "CUSTOMER_HAS_ORDERS",
  ORDER_NOT_FOUND: "ORDER_NOT_FOUND",
  CART_EMPTY: "CART_EMPTY",
  ITEM_NOT_FOUND: "ITEM_NOT_FOUND",
  ITEM_UNAVAILABLE: "ITEM_UNAVAILABLE",
  ITEM_INVALID: "ITEM_INVALID",
  SALE_NOT_TODAY: "SALE_NOT_TODAY",
  // Validation errors
  INVALID_ID: "INVALID_ID",
  INVALID_PAGE: "INVALID_PAGE",
  INVALID_QUANTITY: "INVALID_QUANTITY",
  INVALID_PRICE: "INVALID_PRICE",
  INVALID_AMOUNT: "INVALID_AMOUNT",
  INVALID_ISBN: "INVALID_ISBN",
  INVALID_DATE: "INVALID_DATE",
  INVALID_NB: "INVALID_NB",
  INVALID_NUMBER: "INVALID_NUMBER",
  INVALID_NAME: "INVALID_NAME",
  // REST routes
  UNAUTHENTICATED: "UNAUTHENTICATED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  MISSING_USERNAME: "MISSING_USERNAME",
  LOGIN_ERROR: "LOGIN_ERROR",
  INVALID_PARAMETER: "INVALID_PARAMETER",
  BOOK_NOT_FOUND: "BOOK_NOT_FOUND",
  BOOK_FETCH_FAILED: "BOOK_FETCH_FAILED",
  EXPORT_FAILED: "EXPORT_FAILED",
  MISSING_FILE: "MISSING_FILE",
  UNSUPPORTED_FORMAT: "UNSUPPORTED_FORMAT",
  IMPORT_INVALID: "IMPORT_INVALID",
  IMPORT_TOO_MANY_ROWS: "IMPORT_TOO_MANY_ROWS",
  IMPORT_FAILED: "IMPORT_FAILED",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  UNAUTHORIZED: "Votre session a expiré, veuillez vous reconnecter.",
  FORBIDDEN: "Vous n'êtes pas autorisé·e à effectuer cette action.",
  INTERNAL_ERROR: "Une erreur interne est survenue. Merci de réessayer.",
  CUSTOMER_NOT_FOUND: "Client inconnu.",
  CUSTOMER_HAS_ORDERS:
    "Ce client a des commandes et ne peut pas être supprimé.",
  ORDER_NOT_FOUND: "La commande n'existe pas.",
  CART_EMPTY: "Le panier est vide.",
  ITEM_NOT_FOUND: "Article introuvable.",
  ITEM_UNAVAILABLE: "Article introuvable ou stock insuffisant.",
  ITEM_INVALID: "Article invalide.",
  SALE_NOT_TODAY: "Vous ne pouvez supprimer qu'une vente du jour.",
  INVALID_ID: "Identifiant invalide.",
  INVALID_PAGE: "Numéro de page invalide.",
  INVALID_QUANTITY: "Quantité invalide.",
  INVALID_PRICE: "Prix invalide.",
  INVALID_AMOUNT: "Montant invalide.",
  INVALID_ISBN: "ISBN invalide.",
  INVALID_DATE: "Date invalide.",
  INVALID_NB: "Nombre d'exemplaires invalide.",
  INVALID_NUMBER: "Valeur numérique invalide.",
  INVALID_NAME: "Nom invalide.",
  UNAUTHENTICATED: "Non authentifié·e.",
  INVALID_CREDENTIALS: "Identifiants invalides.",
  MISSING_USERNAME: "Identifiant manquant.",
  LOGIN_ERROR: "Erreur lors du traitement des identifiants.",
  INVALID_PARAMETER: "Paramètre invalide.",
  BOOK_NOT_FOUND: "Aucun résultat.",
  BOOK_FETCH_FAILED: "Impossible de récupérer les données du livre.",
  EXPORT_FAILED: "Impossible d'exporter le stock.",
  MISSING_FILE: "Aucun fichier fourni.",
  UNSUPPORTED_FORMAT: "Format de fichier non pris en charge.",
  IMPORT_INVALID: "Le fichier est invalide. Vérifiez son format.",
  IMPORT_TOO_MANY_ROWS: "Le fichier contient trop de lignes.",
  IMPORT_FAILED: "Erreur lors du traitement du fichier.",
};
