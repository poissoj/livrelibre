import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";

import { userQueryOptions } from "@/lib/queries";

export default function useUser() {
  const query = useQuery(userQueryOptions());
  const user = computed(() => query.data.value);
  return { user };
}
