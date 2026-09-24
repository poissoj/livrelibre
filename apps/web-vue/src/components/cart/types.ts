import type { CART_ERRORS } from "@livrelibre/shared/errors";

export type ISBNError = {
  message: CART_ERRORS;
  isbn: string;
  title?: string;
  id?: number;
};
