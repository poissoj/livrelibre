import { useMutation, useQueryClient } from "@tanstack/vue-query";

import { queryKeys } from "@/lib/queryKeys";

import { type RouterInput, trpcClient } from "./trpc";

export const useBookmark = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (input: RouterInput["star"]) => trpcClient.star.mutate(input),
    onSuccess(_data, vars) {
      void queryClient.invalidateQueries({ queryKey: queryKeys.items.bookmarks });
      void queryClient.invalidateQueries({ queryKey: queryKeys.items.detail(vars.id) });
    },
  });
  const star = (id: number, starred: boolean) => {
    if (mutation.isPending.value) {
      return;
    }
    mutation.mutate({ id, starred });
  };
  return { star, mutation };
};
