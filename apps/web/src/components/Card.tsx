import { clsx } from "clsx";
import { ErrorBoundary } from "react-error-boundary";

import { ErrorMessage } from "@/components/ErrorMessage";

export const Card = ({
  children,
  className,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <section
    className={clsx(
      "bg-white rounded p-md 2xl:p-lg",
      "shadow-[0_2px_2px_0_rgb(0_0_0/0.14),0_1px_5px_0_rgb(0_0_0/0.12),0_3px_1px_-2px_rgb(0_0_0/0.2)]",
      className,
    )}
  >
    {children}
  </section>
);

export const CardBody = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={clsx("mt-md overflow-auto flex", className)}>
    <ErrorBoundary FallbackComponent={ErrorMessage}>{children}</ErrorBoundary>
  </div>
);

export const CardTitle = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => <h3 className={clsx("text-2xl font-bold", className)}>{children}</h3>;

export const CardFooter = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={clsx(
      "[border-top:1px_solid_#ddd] mt-sm [padding:16px_8px_8px_0]",
      className,
    )}
  >
    {children}
  </div>
);
