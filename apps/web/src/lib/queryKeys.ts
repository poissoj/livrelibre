/**
 * Single source of truth for TanStack Query keys.
 *
 * Each domain exposes a `root` key (used for prefix invalidation) and typed
 * builders for parameterised keys. Reactive call sites pass a getter:
 *   queryKey: () => queryKeys.items.detail(id.value)
 */
export const queryKeys = {
  user: {
    root: ["user"] as const,
  },

  cart: {
    root: ["cart"] as const,
    aside: ["asideCart"] as const,
    selectedCustomer: ["selectedCustomer"] as const,
  },

  items: {
    root: ["items"] as const,
    list: (page: number) => ["items", page] as const,
    detailRoot: ["searchItem"] as const,
    detail: (id: number) => ["searchItem", id] as const,
    orders: (id: number) => ["itemOrders", id] as const,
    lastSales: (id: number) => ["lastSales", id] as const,
    isbn: (isbn: string) => ["isbnSearch", isbn] as const,
    bookmarks: ["bookmarks"] as const,
    quicksearchRoot: ["quicksearch"] as const,
    quicksearch: (params: { search: string; page?: number; inStock?: boolean }) =>
      ["quicksearch", params] as const,
    advancedSearchRoot: ["advancedSearch"] as const,
    advancedSearch: (params: { search: Record<string, string>; page: number }) =>
      ["advancedSearch", params] as const,
  },

  customers: {
    root: ["customers"] as const,
    list: (params: unknown) => ["customers", params] as const,
    detailRoot: ["customer"] as const,
    detail: (id: number) => ["customer", id] as const,
    orders: (id: number) => ["customerOrders", id] as const,
    searchRoot: ["searchCustomer"] as const,
    search: (query: string) => ["searchCustomer", query] as const,
  },

  orders: {
    root: ["orders"] as const,
    list: (input: unknown) => ["orders", input] as const,
    detail: (id: number) => ["order", id] as const,
  },

  sales: {
    root: ["sales"] as const,
    byMonth: (params: { month: string; year: string }) => ["salesByMonth", params] as const,
    byDayRoot: ["salesByDay"] as const,
    byDay: (date: string) => ["salesByDay", date] as const,
    search: (input: unknown) => ["searchSales", input] as const,
    best: (input: unknown) => ["bestsales", input] as const,
    stats: ["stats"] as const,
  },

  settings: {
    root: ["settings"] as const,
    itemTypes: ["itemTypes"] as const,
    users: ["users"] as const,
  },
};
