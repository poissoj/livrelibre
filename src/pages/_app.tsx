import { withTRPC } from "@trpc/next";
import type { AppProps } from "next/dist/shared/lib/router/router";
import Head from "next/head";
import React from "react";
import { Slide, ToastContainer } from "react-toastify";

import GlobalStyles from "@/components/GlobalStyles";
import Layout from "@/components/Layout/Layout";
import { APP_NAME } from "@/lib/config";
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
        <title>{APP_NAME}</title>
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
    // During client requests
    if (typeof window !== "undefined") {
      return {
        url: "/api/trpc",
      };
    }

    // During SSR below
    const ONE_DAY_SECONDS = 60 * 60 * 24;
    ctx?.res?.setHeader(
      "Cache-Control",
      `s-maxage=10, stale-while-revalidate=${ONE_DAY_SECONDS}`
    );

    return {
      url: `${getBaseUrl()}/api/trpc`,
      headers() {
        if (ctx?.req) {
          // To use SSR properly, you need to forward the client's headers to the server
          // This is so you can pass through things like cookies when we're server-side rendering
          const {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            connection,
            ...headers
          } = ctx.req.headers;
          return { ...headers, "x-ssr": "1" };
        }
        return {};
      },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
})(MyApp);

// export default MyApp;
