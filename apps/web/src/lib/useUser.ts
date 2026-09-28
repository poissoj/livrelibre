import { computed } from "vue";

import { useTRPCQuery } from "@/utils/query";

export default function useUser() {
  const query = useTRPCQuery("user", undefined, { retry: 1 });
  const user = computed(() => query.data.value);
  const isLoggedIn = computed(
    () => user.value !== undefined && user.value.role !== "anonymous",
  );

  return { user, isLoggedIn };
}
