import { trpc } from "./trpc";

export const useAddToCart = () => {
  const utils = trpc.useContext();
  const mutation = trpc.useMutation("addToCart", {
    async onSuccess() {
      await Promise.all([
        utils.invalidateQueries("cart"),
        utils.invalidateQueries("bookmarks"),
        utils.invalidateQueries("quicksearch"),
        utils.invalidateQueries("items"),
        utils.invalidateQueries("advancedSearch"),
      ]);
    },
  });
  return mutation;
};
