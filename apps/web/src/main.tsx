import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "@/global.css";
import { router } from "@/router";
import { trpc } from "@/utils/trpc";

config.autoAddCss = false;

const queryClient = new QueryClient();
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
