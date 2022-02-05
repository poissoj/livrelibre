import { createReactQueryHooks } from "@trpc/react";
import type { inferProcedureOutput } from "@trpc/server";

import type { AppRouter } from "@/pages/api/trpc/[trpc]";

export const trpc = createReactQueryHooks<AppRouter>();

export const useBookmark = () => {
  const utils = trpc.useContext();
  const mutation = trpc.useMutation(["star"], {
    onSuccess(_input, vars) {
      void utils.invalidateQueries(["bookmarks"]);
      void utils.invalidateQueries(["searchItem", vars.id]);
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

export type TQuery = keyof AppRouter["_def"]["queries"];
export type InferQueryOutput<TRouteKey extends TQuery> = inferProcedureOutput<
  AppRouter["_def"]["queries"][TRouteKey]
>;
