import { computed, watch } from "vue";
import { useRouter } from "vue-router";

import { useTRPCQuery } from "@/utils/query";

export default function useUser({
  redirectTo = "",
  redirectIfFound = false,
}: { redirectTo?: string; redirectIfFound?: boolean } = {}) {
  const router = useRouter();
  const query = useTRPCQuery("user", undefined, { retry: 1 });
  const user = computed(() => query.data.value);
  const isLoggedIn = computed(
    () => user.value !== undefined && user.value.role !== "anonymous",
  );

  watch(
    [() => query.isPending.value, () => query.isError.value, isLoggedIn],
    ([isPending, isError]) => {
      if (!redirectTo || isPending || isError) return;
      if (
        (!redirectIfFound && !isLoggedIn.value) ||
        (redirectIfFound && isLoggedIn.value)
      ) {
        void router.replace(redirectTo);
      }
    },
    { immediate: true },
  );

  return {
    user,
    isLoggedIn,
    isPending: query.isPending,
    isError: query.isError,
  };
}
