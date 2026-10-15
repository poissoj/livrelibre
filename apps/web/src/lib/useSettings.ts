import { DEFAULT_SETTINGS } from "@livrelibre/shared/settings";
import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";

import { trpcClient } from "@/utils/trpc";

/**
 * Réglages de l'application, chargés depuis l'API. Retombe sur les valeurs par
 * défaut tant que les réglages ne sont pas (encore) chargés.
 */
export default function useSettings() {
  const query = useQuery({
    queryKey: ["settings"],
    queryFn: () => trpcClient.settings.query(),
    staleTime: Infinity,
  });

  const loyaltyDiscountPercent = computed(
    () => query.data.value?.loyaltyDiscountPercent ?? DEFAULT_SETTINGS.loyaltyDiscountPercent,
  );

  return { settings: query.data, loyaltyDiscountPercent };
}
