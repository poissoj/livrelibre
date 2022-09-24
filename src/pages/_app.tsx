import { withTRPC } from "@trpc/next";
import type { AppProps } from "next/dist/shared/lib/router/router";
import Head from "next/head";
import React from "react";
import { Slide, ToastContainer } from "react-toastify";

import GlobalStyles from "@/components/GlobalStyles";
import Layout from "@/components/Layout/Layout";
import useUser from "@/lib/useUser";
import type { AppRouter } from "@/pages/api/trpc/[trpc]";

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  const { isLoggedIn } = useUser({ redirectTo: "/login" });
  const PageLayout =
    "isPublic" in Component || !isLoggedIn ? React.Fragment : Layout;
  const showComponent = "isPublic" in Component ? true : isLoggedIn;

  return (
    <PageLayout>
      <Head>
        <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <GlobalStyles />
      {showComponent && <Component {...pageProps} />}
      <ToastContainer
        position="bottom-right"
        theme="colored"
        transition={Slide}
      />
    </PageLayout>
  );
}

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

export default withTRPC<AppRouter>({
  config({ ctx }) {
    if (typeof window !== "undefined") {
      return {
        url: "/api/trpc",
      };
    }
    const ONE_DAY_SECONDS = 60 * 60 * 24;
    ctx?.res?.setHeader(
      "Cache-Control",
      `s-maxage=10, stale-while-revalidate=${ONE_DAY_SECONDS}`
    );

    return {
      url: `${getBaseUrl()}/api/trpc`,
      headers: { "x-ssr": "1" },
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
})(MyApp);

// export default MyApp;
