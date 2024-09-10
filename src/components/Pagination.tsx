import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { clsx } from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";

const LINK_STYLES =
  "border px-md py-sm text-primary-darker [border-color:#AAA]";

const ConditionalLink = ({
  children,
  className,
  linkIf,
  ...props
}: {
  linkIf: boolean;
  className?: string;
} & React.ComponentPropsWithoutRef<typeof Link>) => {
  if (linkIf) {
    return (
      <Link className={clsx(LINK_STYLES, className)} {...props}>
        {children}
      </Link>
    );
  }
  return <span className={LINK_STYLES}>{children}</span>;
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
        <ConditionalLink
          linkIf={page > 1}
          href={makeHref(page - 1)}
          className="rounded-l-md"
          title="Page précédente"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </ConditionalLink>
      </li>
      {pageList.map((n) => (
        <li key={n}>
          {n === page ? (
            <span
              className={
                LINK_STYLES +
                " text-white bg-primary-darker border-primary-darker"
              }
            >
              {n}
            </span>
          ) : (
            <ConditionalLink linkIf={n > 0} href={makeHref(n)}>
              {n || "…"}
            </ConditionalLink>
          )}
        </li>
      ))}
      <li>
        <ConditionalLink
          linkIf={page < count}
          href={makeHref(page + 1)}
          className="rounded-r-md"
          title="Page suivante"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </ConditionalLink>
      </li>
    </ol>
  );
};
