import { AppProps } from "next/dist/shared/lib/router/router";
import GlobalStyles from "@/components/GlobalStyles";
import Layout from "@/components/Layout/Layout";

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <Layout>
      <GlobalStyles />
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
