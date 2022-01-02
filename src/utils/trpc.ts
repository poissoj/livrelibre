import { createReactQueryHooks } from "@trpc/react";
import type { AppRouter } from "@/pages/api/trpc/[trpc]";

export const trpc = createReactQueryHooks<AppRouter>();

export const useBookmark = () => {
  const utils = trpc.useContext();
  const mutation = trpc.useMutation(["star"], {
    onSuccess(_input, vars) {
      utils.invalidateQueries(["bookmarks"]);
      utils.invalidateQueries(["searchItem", vars.id]);
    },
  });
  const star = (id: string, starred: boolean) => {
    if (mutation.isLoading) {
      return;
    }
    mutation.mutate({ id, starred });
  };
  return { star, mutation };
};
