import { httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@/pages/api/trpc/[trpc]";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return "";
  }

  // reference for vercel.com
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // self-hosted
  if (process.env.APP_URL) {
    return process.env.APP_URL;
  }

  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    };
  },
});

export const useBookmark = () => {
  const utils = trpc.useUtils();
  const mutation = trpc.star.useMutation({
    onSuccess(_input, vars) {
      void utils.bookmarks.invalidate();
      void utils.searchItem.invalidate(vars.id);
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

export type RouterOutput = inferRouterOutputs<AppRouter>;
