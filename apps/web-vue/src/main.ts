import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  VueQueryPlugin,
} from "@tanstack/vue-query";
import { isTRPCClientError } from "@trpc/client";
import { createApp } from "vue";
import { toast } from "vue-sonner";
import "vue-sonner/style.css";

import type { AppRouter } from "@livrelibre/server/router";

import "@/global.css";
import { router } from "@/router";
import { getErrorMessage } from "@/utils/errors";
import { trpcQueryOptions } from "@/utils/query";

import App from "./App.vue";

config.autoAddCss = false;

function handleError(error: unknown, meta?: Record<string, unknown>) {
  if (
    isTRPCClientError<AppRouter>(error) &&
    error.data?.code === "UNAUTHORIZED"
  ) {
    queryClient.clear();
    if (router.currentRoute.value.path !== "/login") {
      void router.push("/login");
    }
    return;
  }
  if (meta?.errorToast === false) {
    return;
  }
  toast.error(getErrorMessage(error));
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      handleError(error, query.meta);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      handleError(error, mutation.meta);
    },
  }),
});

const isLoggedIn = async (): Promise<boolean> => {
  try {
    const user = await queryClient.query({
      ...trpcQueryOptions("user", undefined),
      staleTime: "static",
    });
    return user.role !== "anonymous";
  } catch {
    return false;
  }
};

router.beforeEach(async (to) => {
  const loggedIn = await isLoggedIn();
  if (to.path === "/login") {
    return loggedIn ? { path: "/" } : true;
  }
  return loggedIn ? true : { path: "/login" };
});

const app = createApp(App);
app.use(router);
app.use(VueQueryPlugin, { queryClient });
app.mount("#app");
