import { clsx } from "clsx";

type MainProps = {
  className?: string;
  children: React.ReactNode;
};
export const Main = ({ className, children }: MainProps): JSX.Element => {
  return (
    <main className={clsx("p-lg flex overflow-auto", className)}>
      {children}
    </main>
  );
};
