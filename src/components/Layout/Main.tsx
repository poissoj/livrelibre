import "twin.macro";

type MainProps = {
  className?: string;
  children: React.ReactNode;
};
export const Main = ({ className, children }: MainProps): JSX.Element => {
  return (
    <main className={className} tw="p-lg flex overflow-auto">
      {children}
    </main>
  );
};
