import { ErrorBoundary } from "react-error-boundary";
import tw, { styled } from "twin.macro";

import { ErrorMessage } from "@/components/ErrorMessage";

const SHADOW = `
0 2px 2px 0 rgba(0, 0, 0, 0.14),
0 1px 5px 0 rgba(0, 0, 0, 0.12),
0 3px 1px -2px rgba(0, 0, 0, 0.2)`;

export const Card = styled.section({
  ...tw`bg-white border-radius[4px] p-md 2xl:p-lg`,
  boxShadow: SHADOW,
});

export const CardBody = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div tw="mt-md overflow-auto flex" className={className}>
    <ErrorBoundary FallbackComponent={ErrorMessage}>{children}</ErrorBoundary>
  </div>
);

export const CardTitle = tw.h3`text-2xl font-bold`;

export const CardFooter = tw.div`border-top[1px solid #ddd] mt-sm padding[16px 8px 8px 0]`;
