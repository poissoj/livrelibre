import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clsx } from "clsx";
import Link, { type LinkProps } from "next/link";
import { useRouter } from "next/router";

const Anchor = ({
  children,
  className,
  ...props
}: React.PropsWithChildren<{ className?: string }> &
  JSX.IntrinsicElements["a"]) => (
  <a
    className={clsx(
      "border px-md py-sm text-primary-darker [border-color:#AAA]",
      className,
    )}
    {...props}
  >
    {children}
  </a>
);

const ConditionalLink = ({
  href,
  children,
}: {
  href: LinkProps["href"] | null;
  children: React.ReactNode;
}) => {
  if (href) {
    return (
      <Link href={href} passHref legacyBehavior>
        {children}
      </Link>
    );
  }
  return <>{children}</>;
};

const range = (start: number, end: number) => {
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => start + i);
};

const createPageList = (pageNumber: number, count: number) => {
  const startPages = range(1, Math.min(1, count));
  const endPages = range(Math.max(count, 2), count);

  const siblingsStart = Math.max(Math.min(pageNumber - 2, count - 6), 3);
  const siblingsEnd = Math.min(
    Math.max(pageNumber + 2, 7),
    endPages.length > 0 ? endPages[0] - 2 : count - 1,
  );

  return [
    ...startPages,
    ...(siblingsStart > 3 ? [0] : count > 3 ? [2] : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - 2 ? [0] : count > 2 ? [count - 1] : []),
    ...endPages,
  ];
};

type PaginationProps = {
  count: number;
};
export const Pagination = ({ count }: PaginationProps) => {
  const { query, pathname } = useRouter();
  const { page: queryPage } = query;
  const page = typeof queryPage === "string" ? Number(queryPage) : 1;
  const makeHref = (nb: number) => ({
    pathname,
    query: { ...query, page: nb },
  });
  const pageList = createPageList(page, count);

  return (
    <ol className="flex">
      <li>
        <ConditionalLink href={page > 1 ? makeHref(page - 1) : null}>
          <Anchor className="rounded-l-md" title="Page précédente">
            <FontAwesomeIcon icon={faChevronLeft} />
          </Anchor>
        </ConditionalLink>
      </li>
      {pageList.map((n, i) => (
        <li key={i}>
          {n === page ? (
            <Anchor className="text-white bg-primary-darker border-primary-darker">
              {n}
            </Anchor>
          ) : (
            <ConditionalLink href={n > 0 ? makeHref(n) : null}>
              <Anchor>{n || "…"}</Anchor>
            </ConditionalLink>
          )}
        </li>
      ))}
      <li>
        <ConditionalLink href={page < count ? makeHref(page + 1) : null}>
          <Anchor className="rounded-r-md" title="Page suivante">
            <FontAwesomeIcon icon={faChevronRight} />
          </Anchor>
        </ConditionalLink>
      </li>
    </ol>
  );
};
