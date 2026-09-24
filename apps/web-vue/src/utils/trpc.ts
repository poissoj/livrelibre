import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@livrelibre/server/router";

export const trpcClient = createTRPCClient<AppRouter>({
  links: [httpBatchLink({ url: "/api/trpc" })],
});

export type RouterOutput = inferRouterOutputs<AppRouter>;
