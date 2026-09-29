import type { CartError } from "@livrelibre/shared/errors";

export type ISBNError = {
  message: CartError;
  isbn: string;
  title?: string;
  id?: number;
};
