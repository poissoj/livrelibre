import { useLocation, useNavigate, useSearchParams } from "react-router";

type QueryValue = string | string[] | number | undefined;

export function useQueryParams() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const query: Record<string, string | string[]> = {};
  for (const key of new Set(searchParams.keys())) {
    const values = searchParams.getAll(key);
    query[key] = values.length === 1 ? values[0] : values;
  }

  const push = async ({
    query: next,
    pathname = location.pathname,
  }: {
    query: Record<string, QueryValue>;
    pathname?: string;
  }) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(next)) {
      if (value === undefined) continue;
      for (const v of Array.isArray(value) ? value : [value]) {
        params.append(key, String(v));
      }
    }
    const search = params.toString();
    await navigate(search ? `${pathname}?${search}` : pathname);
  };

  return { query, push, pathname: location.pathname, searchParams };
}
