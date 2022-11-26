import { trpc } from "./trpc";

export const useAddToCart = () => {
  const utils = trpc.useContext();
  const mutation = trpc.addToCart.useMutation({
    async onSuccess() {
      await Promise.all([
        utils.cart.invalidate(),
        utils.bookmarks.invalidate(),
        utils.quicksearch.invalidate(),
        utils.items.invalidate(),
        utils.advancedSearch.invalidate(),
      ]);
    },
  });
  return mutation;
};
