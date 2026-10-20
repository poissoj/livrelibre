import { queryOptions } from "@tanstack/vue-query";

import { queryKeys } from "@/lib/queryKeys";
import { trpcClient } from "@/utils/trpc";

/**
 * Shared query options for resources consumed by several components.
 * Keeping the key and queryFn in one place prevents them from drifting between
 * call sites (and makes invalidation predictable).
 */
export const userQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.user.root,
    queryFn: () => trpcClient.user.query(),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

export const cartQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.cart.root,
    queryFn: () => trpcClient.cart.query(),
  });

export const asideCartQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.cart.aside,
    queryFn: () => trpcClient.asideCart.query(),
  });

export const itemTypesQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.settings.itemTypes,
    queryFn: () => trpcClient.itemTypes.query(),
    staleTime: Infinity,
  });

export const paymentMethodsQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.settings.paymentMethods,
    queryFn: () => trpcClient.paymentMethods.query(),
    staleTime: Infinity,
  });

export const settingsQueryOptions = () =>
  queryOptions({
    queryKey: queryKeys.settings.root,
    queryFn: () => trpcClient.settings.query(),
    staleTime: Infinity,
  });
