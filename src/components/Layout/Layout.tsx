import "twin.macro";

import { Header } from "./Header";
import { Main } from "./Main";
import { Sidebar } from "./Sidebar";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps): JSX.Element => {
  return (
    <div tw="h-full flex flex-col">
      <Header />
      <div tw="flex flex-1 overflow-hidden">
        <Sidebar />
        <Main tw="flex-1">{children}</Main>
      </div>
    </div>
  );
};

export default Layout;
