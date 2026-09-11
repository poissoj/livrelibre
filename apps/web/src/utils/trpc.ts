import { createTRPCReact } from "@trpc/react-query";
import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@livrelibre/server/router";

export const trpc = createTRPCReact<AppRouter>();

export const useBookmark = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.star.useMutation({
    onSuccess(_input, vars) {
      void utils.bookmarks.invalidate();
      void utils.searchItem.invalidate(vars.id);
    },
  });
  const star = (id: number, starred: boolean) => {
    if (mutation.isPending) {
      return;
    }
    mutation.mutate({ id, starred });
  };
  return { star, mutation };
};

export type RouterOutput = inferRouterOutputs<AppRouter>;
