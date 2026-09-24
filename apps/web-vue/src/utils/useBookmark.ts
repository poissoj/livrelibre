import { useTRPCMutation, useTRPCUtils } from "./query";

export const useBookmark = () => {
  const utils = useTRPCUtils();
  const mutation = useTRPCMutation("star", {
    onSuccess(_data, vars) {
      void utils.invalidate("bookmarks");
      void utils.invalidate("searchItem", vars.id);
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
