import type { QueryClient } from "@tanstack/vue-query";

const CART_RELATED = ["cart", "bookmarks", "quicksearch", "items", "advancedSearch"];

export const refreshCartRelated = (queryClient: QueryClient): Promise<unknown[]> =>
  Promise.all(CART_RELATED.map((path) => queryClient.invalidateQueries({ queryKey: [path] })));
