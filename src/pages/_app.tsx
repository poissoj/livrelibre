import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import type { AppProps } from "next/dist/shared/lib/router/router";
import Head from "next/head";
import React from "react";
import { Slide, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Layout from "@/components/Layout/Layout";
import "@/global.css";
import { APP_NAME } from "@/lib/config";
import useUser from "@/lib/useUser";
import { trpc } from "@/utils/trpc";

config.autoAddCss = false;

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
      {showComponent && <Component {...pageProps} />}
      <ToastContainer
        position="bottom-left"
        theme="colored"
        transition={Slide}
      />
    </PageLayout>
  );
}

export default trpc.withTRPC(MyApp);

// export default MyApp;
