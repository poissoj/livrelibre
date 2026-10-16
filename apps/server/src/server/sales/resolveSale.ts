import type { DbSale, Sale, SaleItem } from "./types";

/**
 * Turns a raw sales row into a display sale. When the referenced item can no
 * longer be found, the sale degrades gracefully to an "unlisted" sale instead
 * of failing the whole day's aggregation.
 */
export const resolveSale = (sale: DbSale, item: SaleItem | undefined): Sale => {
  if (sale.itemId && item) {
    return {
      ...item,
      itemId: sale.itemId,
      price: sale.price,
      tva: sale.tva,
      paymentType: sale.paymentType,
      quantity: sale.quantity,
      deleted: sale.deleted,
      id: sale.id,
      linkedToCustomer: sale.linkedToCustomer,
    };
  }
  return {
    id: sale.id,
    itemId: null,
    receiptId: sale.receiptId,
    title: sale.title,
    tva: sale.tva,
    price: sale.price,
    paymentType: sale.paymentType,
    quantity: sale.quantity,
    deleted: sale.deleted,
    linkedToCustomer: sale.linkedToCustomer,
  };
};
