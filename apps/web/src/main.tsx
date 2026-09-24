import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { httpBatchLink, isTRPCClientError } from "@trpc/client";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import { Slide, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import type { AppRouter } from "@livrelibre/server/router";

import "@/global.css";
import { router } from "@/router";
import { getErrorMessage } from "@/utils/errors";
import { trpc } from "@/utils/trpc";

config.autoAddCss = false;

const handleError = (error: unknown, meta?: Record<string, unknown>) => {
  if (
    isTRPCClientError<AppRouter>(error) &&
    error.data?.code === "UNAUTHORIZED"
  ) {
    queryClient.clear();
    if (router.state.location.pathname !== "/login") {
      void router.navigate("/login", { replace: true });
    }
    return;
  }
  if (meta?.errorToast === false) {
    return;
  }
  const message = getErrorMessage(error);
  toast.error(message, { toastId: message });
};

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
const trpcClient = trpc.createClient({
  links: [httpBatchLink({ url: "/api/trpc" })],
});

const rootElement = document.getElementById("root");
if (rootElement == null) {
  throw new Error("Root element #root not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <RouterProvider router={router} />
        <ToastContainer
          position="bottom-left"
          theme="colored"
          transition={Slide}
        />
      </trpc.Provider>
    </QueryClientProvider>
  </React.StrictMode>,
);
