import { Header } from "./Header";
import { Main } from "./Main";
import { Sidebar } from "./Sidebar";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps): JSX.Element => {
  return (
    <div className="h-full flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Main className="flex-1">{children}</Main>
      </div>
    </div>
  );
};

export default Layout;
