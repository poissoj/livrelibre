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
import { USER_QUERY_OPTIONS } from "@/lib/userQuery";
import { router } from "@/router";
import { getErrorMessage, logUnexpectedError } from "@/utils/errors";
import { trpcQueryOptions } from "@/utils/query";

import App from "./App.vue";

config.autoAddCss = false;

const loginRedirect = (fullPath: string) =>
  fullPath === "/"
    ? { path: "/login" }
    : { path: "/login", query: { redirect: fullPath } };

const redirectToLogin = () => {
  const current = router.currentRoute.value;
  if (current.path !== "/login") {
    void router.push(loginRedirect(current.fullPath));
  }
};

function handleError(error: unknown, meta?: Record<string, unknown>) {
  if (
    isTRPCClientError<AppRouter>(error) &&
    error.data?.code === "UNAUTHORIZED"
  ) {
    // Session expirée pendant un refetch en arrière-plan : annuler les requêtes
    // en cours pour éviter une tempête de refetch avant la redirection.
    void queryClient.cancelQueries();
    queryClient.clear();
    redirectToLogin();
    return;
  }
  if (meta?.errorToast === false) {
    return;
  }
  const message = getErrorMessage(error);
  toast.error(message, { id: message });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const status = isTRPCClientError<AppRouter>(error)
          ? error.data?.httpStatus
          : undefined;
        // Never retry a client error (4xx): it won't recover on its own.
        if (typeof status === "number" && status < 500) {
          return false;
        }
        // Network / 5xx / unknown status: retry at most once.
        return failureCount < 1;
      },
      retryDelay: 300,
    },
  },
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

const fetchUser = () =>
  queryClient.query({
    ...trpcQueryOptions("user", undefined),
    ...USER_QUERY_OPTIONS,
  });

router.beforeEach(async (to) => {
  let loggedIn: boolean;
  try {
    const user = await fetchUser();
    loggedIn = user.role !== "anonymous";
  } catch {
    // Erreur transitoire (réseau, 500) : ne pas déconnecter l'utilisateur.
    // La vue ciblée affichera l'erreur ; une nouvelle tentative aura lieu à la
    // prochaine navigation.
    return true;
  }
  if (to.path === "/login") {
    return loggedIn ? { path: "/" } : true;
  }
  return loggedIn ? true : loginRedirect(to.fullPath);
});

const app = createApp(App);
app.config.errorHandler = (error) => {
  logUnexpectedError(error);
};
app.use(router);
app.use(VueQueryPlugin, { queryClient });
app.mount("#app");
