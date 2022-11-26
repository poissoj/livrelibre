import type { AppProps } from "next/dist/shared/lib/router/router";
import Head from "next/head";
import React from "react";
import { Slide, ToastContainer } from "react-toastify";

import GlobalStyles from "@/components/GlobalStyles";
import Layout from "@/components/Layout/Layout";
import { APP_NAME } from "@/lib/config";
import useUser from "@/lib/useUser";
import { trpc } from "@/utils/trpc";

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

export default trpc.withTRPC(MyApp);

// export default MyApp;
