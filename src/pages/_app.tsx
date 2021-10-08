import { withTRPC } from "@trpc/next";
import { AppProps } from "next/dist/shared/lib/router/router";
import GlobalStyles from "@/components/GlobalStyles";
import Layout from "@/components/Layout/Layout";
import type { AppRouter } from "@/pages/api/trpc/[trpc]";

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <Layout>
      <GlobalStyles />
      <Component {...pageProps} />
    </Layout>
  );
}

export default withTRPC<AppRouter>({
  config() {
    const url = process.env.APP_URL
      ? `https://${process.env.APP_URL}/api/trpc`
      : "http://localhost:3000/api/trpc";

    return {
      url,
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
