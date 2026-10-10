import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";

import { USER_QUERY_OPTIONS } from "@/lib/userQuery";
import { trpcClient } from "@/utils/trpc";

export default function useUser() {
  const query = useQuery({
    queryKey: ["user"],
    queryFn: () => trpcClient.user.query(),
    ...USER_QUERY_OPTIONS,
  });
  const user = computed(() => query.data.value);
  return { user };
}
