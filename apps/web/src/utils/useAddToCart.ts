import { toast } from "vue-sonner";

import { getErrorMessage } from "./errors";
import { refreshCartRelated } from "./invalidations";
import { useTRPCMutation, useTRPCUtils } from "./query";

export const useAddToCart = () => {
  const utils = useTRPCUtils();
  return useTRPCMutation("addToCart", {
    meta: { errorToast: false },
    async onSuccess() {
      await refreshCartRelated(utils);
    },
    onError(error) {
      toast.error(getErrorMessage(error));
    },
  });
};
