import { useMutation, useQueryClient } from "@tanstack/vue-query";

import { refreshCartRelated } from "./invalidations";
import { type RouterInput, trpcClient } from "./trpc";

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RouterInput["addToCart"]) => trpcClient.addToCart.mutate(input),
    async onSuccess() {
      await refreshCartRelated(queryClient);
    },
  });
};
