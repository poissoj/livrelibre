import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

import { getErrorMessage } from "./errors";
import { refreshCartRelated } from "./invalidations";
import { type RouterInput, trpcClient } from "./trpc";

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RouterInput["addToCart"]) => trpcClient.addToCart.mutate(input),
    meta: { errorToast: false },
    async onSuccess() {
      await refreshCartRelated(queryClient);
    },
    onError(error) {
      toast.error(getErrorMessage(error));
    },
  });
};
