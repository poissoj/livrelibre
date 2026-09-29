import { computed } from "vue";

import { USER_QUERY_OPTIONS } from "@/lib/userQuery";
import { useTRPCQuery } from "@/utils/query";

export default function useUser() {
  const query = useTRPCQuery("user", undefined, USER_QUERY_OPTIONS);
  const user = computed(() => query.data.value);
  const isLoggedIn = computed(
    () => user.value !== undefined && user.value.role !== "anonymous",
  );

  return { user, isLoggedIn, isLoading: query.isLoading };
}
