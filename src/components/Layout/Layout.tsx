import Head from "next/head";
import "twin.macro";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Main } from "./Main";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps): JSX.Element => {
  return (
    <div tw="h-full flex flex-col">
      <Head>
        <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div tw="flex flex-1 overflow-hidden">
        <Sidebar />
        <Main tw="flex-1">{children}</Main>
      </div>
    </div>
  );
};

export default Layout;
