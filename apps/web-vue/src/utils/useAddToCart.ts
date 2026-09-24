import { toast } from "vue-sonner";

import { getErrorMessage } from "./errors";
import { useTRPCMutation, useTRPCUtils } from "./query";

export const useAddToCart = () => {
  const utils = useTRPCUtils();
  return useTRPCMutation("addToCart", {
    meta: { errorToast: false },
    async onSuccess() {
      await Promise.all([
        utils.invalidate("cart"),
        utils.invalidate("bookmarks"),
        utils.invalidate("quicksearch"),
        utils.invalidate("items"),
        utils.invalidate("advancedSearch"),
      ]);
    },
    onError(error) {
      toast.error(getErrorMessage(error));
    },
  });
};
