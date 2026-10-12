import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";

import { trpcClient } from "@/utils/trpc";

/**
 * Types d'article configurables, chargés depuis l'API. `label` retombe sur le
 * code si le type n'est pas (encore) connu, pour ne jamais afficher de vide.
 */
export default function useItemTypes() {
  const query = useQuery({
    queryKey: ["itemTypes"],
    queryFn: () => trpcClient.itemTypes.query(),
    staleTime: Infinity,
  });

  const types = computed(() => query.data.value ?? []);
  const activeTypes = computed(() =>
    types.value
      .filter((type) => type.active)
      .slice()
      .sort((a, b) => a.position - b.position || a.label.localeCompare(b.label)),
  );
  const labels = computed(() => new Map(types.value.map((type) => [type.code, type.label])));
  const defaultCode = computed(() => {
    const flagged = types.value.find((type) => type.isDefault);
    if (flagged) return flagged.code;
    return activeTypes.value.at(0)?.code ?? "";
  });

  const label = (code: string): string => labels.value.get(code) ?? code;

  return { types, activeTypes, defaultCode, label };
}
