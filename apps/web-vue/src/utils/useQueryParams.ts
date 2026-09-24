import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

type QueryValue = string | string[] | number | undefined;

export function useQueryParams() {
  const route = useRoute();
  const router = useRouter();

  const query = computed<Record<string, string | string[]>>(() => {
    const result: Record<string, string | string[]> = {};
    for (const [key, value] of Object.entries(route.query)) {
      if (value === null) continue;
      result[key] = Array.isArray(value)
        ? value.filter((v): v is string => v !== null)
        : value;
    }
    return result;
  });

  const pathname = computed(() => route.path);

  const searchParams = computed(() => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query.value)) {
      for (const v of Array.isArray(value) ? value : [value]) {
        params.append(key, v);
      }
    }
    return params;
  });

  const push = async ({
    query: next,
    pathname: path = route.path,
    replace = false,
  }: {
    query: Record<string, QueryValue>;
    pathname?: string;
    replace?: boolean;
  }) => {
    const cleaned: Record<string, string | string[]> = {};
    for (const [key, value] of Object.entries(next)) {
      if (value === undefined) continue;
      cleaned[key] = Array.isArray(value) ? value : String(value);
    }
    await router.push({ path, query: cleaned, replace });
  };

  return { query, push, pathname, searchParams };
}
