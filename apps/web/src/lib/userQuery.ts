import type { UseQueryOptions } from "@tanstack/vue-query";

/**
 * Options partagées par tous les observateurs de la query `user`
 * (guard du router et composable `useUser`) afin que la fraîcheur du cache
 * soit calculée de la même manière des deux côtés.
 */
export const USER_QUERY_OPTIONS = {
  retry: 1,
  staleTime: 5 * 60 * 1000,
} as const satisfies Partial<UseQueryOptions>;
