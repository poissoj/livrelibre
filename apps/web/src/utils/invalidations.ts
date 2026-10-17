import type { QueryClient } from "@tanstack/vue-query";

import { queryKeys } from "@/lib/queryKeys";

/**
 * Invalidate everything that depends on stock/cart contents.
 */
export const refreshCartRelated = (queryClient: QueryClient): Promise<unknown[]> =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.cart.root }),
    queryClient.invalidateQueries({ queryKey: queryKeys.cart.aside }),
    queryClient.invalidateQueries({ queryKey: queryKeys.items.root }),
    queryClient.invalidateQueries({ queryKey: queryKeys.items.detailRoot }),
    queryClient.invalidateQueries({ queryKey: queryKeys.items.bookmarks }),
    queryClient.invalidateQueries({ queryKey: queryKeys.items.quicksearchRoot }),
    queryClient.invalidateQueries({ queryKey: queryKeys.items.advancedSearchRoot }),
  ]);
