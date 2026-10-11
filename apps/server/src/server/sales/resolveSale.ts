import type { Item } from "@livrelibre/shared/schema";

import type { DbSale, Sale } from "./types";

/**
 * Turns a raw sales row into a display sale. When the referenced item can no
 * longer be found, the sale degrades gracefully to an "unlisted" sale instead
 * of failing the whole day's aggregation.
 */
export const resolveSale = (sale: DbSale, itemById: Map<number, Item>): Sale => {
  if (sale.itemId) {
    const item = itemById.get(sale.itemId);
    if (item) {
      return {
        ...item,
        itemId: sale.itemId,
        price: sale.price,
        paymentType: sale.paymentType,
        quantity: sale.quantity,
        deleted: sale.deleted,
        id: sale.id,
        linkedToCustomer: sale.linkedToCustomer,
      };
    }
  }
  return {
    ...sale,
    paymentType: sale.paymentType,
    itemId: null,
    deleted: sale.deleted,
    id: sale.id,
    receiptId: sale.receiptId,
  };
};
