import { clsx } from "clsx";
import type { ReactElement } from "react";

type MainProps = {
  className?: string;
  children: React.ReactNode;
};
export const Main = ({ className, children }: MainProps): ReactElement => {
  return (
    <main className={clsx("p-lg flex overflow-auto", className)}>
      {children}
    </main>
  );
};
