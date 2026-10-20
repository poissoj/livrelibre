import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";

import { paymentMethodsQueryOptions } from "@/lib/queries";

/**
 * Moyens de paiement configurables, chargés depuis l'API. `label` retombe sur
 * le code si le moyen n'est pas (encore) connu, pour ne jamais afficher de vide.
 */
export default function usePaymentMethods() {
  const query = useQuery(paymentMethodsQueryOptions());

  const methods = computed(() => query.data.value ?? []);
  const activeMethods = computed(() =>
    methods.value
      .filter((method) => method.active)
      .slice()
      .sort((a, b) => a.position - b.position || a.label.localeCompare(b.label)),
  );
  const labels = computed(
    () => new Map(methods.value.map((method) => [method.code, method.label])),
  );
  const defaultCode = computed(() => {
    const flagged = methods.value.find((method) => method.isDefault && method.active);
    if (flagged) return flagged.code;
    return activeMethods.value.at(0)?.code ?? "";
  });

  const label = (code: string): string => labels.value.get(code) ?? code;

  return { methods, activeMethods, defaultCode, label };
}
