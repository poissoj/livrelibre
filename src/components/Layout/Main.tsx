import "twin.macro";

import type { StrictReactNode } from "@/utils/strictReactNode";

type MainProps = {
  className?: string;
  children: StrictReactNode;
};
export const Main = ({ className, children }: MainProps): JSX.Element => {
  return (
    <main className={className} tw="p-lg flex overflow-auto">
      {children}
    </main>
  );
};
