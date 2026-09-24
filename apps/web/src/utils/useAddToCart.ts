import { toast } from "react-toastify";

import { getErrorMessage } from "./errors";
import { trpc } from "./trpc";

export const useAddToCart = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.addToCart.useMutation({
    meta: { errorToast: false },
    async onSuccess() {
      await Promise.all([
        utils.cart.invalidate(),
        utils.bookmarks.invalidate(),
        utils.quicksearch.invalidate(),
        utils.items.invalidate(),
        utils.advancedSearch.invalidate(),
      ]);
    },
    onError(error) {
      toast.error(getErrorMessage(error));
    },
  });
  return mutation;
};
