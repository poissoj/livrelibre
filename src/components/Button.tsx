import { clsx } from "clsx";
import Link from "next/link";

const COMMON_STYLES =
  "bg-primary-dark text-white rounded p-sm uppercase tracking-wide font-medium " +
  "text-sm whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60";
const HOVER_STYLES =
  "transition-shadow transition-transform " +
  "hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.4)] hover:outline-none hover:-translate-y-px";

export const Button = ({
  className,
  children,
  ...props
}: {
  children?: React.ReactNode;
} & JSX.IntrinsicElements["button"]) => (
  <button
    className={clsx(COMMON_STYLES, !props.disabled && HOVER_STYLES, className)}
    {...props}
  >
    {children}
  </button>
);

export const ButtonAnchor = ({
  className,
  children,
  ...props
}: {
  children?: React.ReactNode;
} & JSX.IntrinsicElements["a"]) => (
  <a className={clsx(COMMON_STYLES, HOVER_STYLES, className)} {...props}>
    {children}
  </a>
);

export const LinkButton = ({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Link>) => (
  <Link className={clsx(COMMON_STYLES, HOVER_STYLES, className)} {...props}>
    {children}
  </Link>
);

export const ButtonWithInput = ({
  className,
  children,
  ...props
}: {
  children?: React.ReactNode;
} & JSX.IntrinsicElements["button"]) => (
  <Button className={clsx("rounded-l-none -m[1px]", className)} {...props}>
    {children}
  </Button>
);
