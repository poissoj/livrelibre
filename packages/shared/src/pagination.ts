export const ITEMS_PER_PAGE = 50;

/**
 * Number of customers per page in the orders page when grouped by customer.
 * Smaller than {@link ITEMS_PER_PAGE} because a grouped page embeds every order
 * of the selected customers, which can be much heavier than a flat page.
 */
export const ORDERS_GROUPS_PER_PAGE = 20;
