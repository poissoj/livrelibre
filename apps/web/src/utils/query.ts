import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/vue-query";
import { type ComputedRef, type MaybeRefOrGetter, type Ref, computed, toValue } from "vue";

import { type RouterInput, type RouterOutput, trpcClient } from "./trpc";

type ProcedureName = keyof RouterInput;

type QueryCaller<K extends ProcedureName> = {
  query: (input: RouterInput[K]) => Promise<RouterOutput[K]>;
};
type MutateCaller<K extends ProcedureName> = {
  mutate: (input: RouterInput[K]) => Promise<RouterOutput[K]>;
};

const isQueryCaller = <K extends ProcedureName>(value: unknown): value is QueryCaller<K> =>
  (typeof value === "object" || typeof value === "function") &&
  value !== null &&
  typeof Reflect.get(value, "query") === "function";

const isMutateCaller = <K extends ProcedureName>(value: unknown): value is MutateCaller<K> =>
  (typeof value === "object" || typeof value === "function") &&
  value !== null &&
  typeof Reflect.get(value, "mutate") === "function";

type ExtraQueryOptions<K extends ProcedureName> = Partial<UseQueryOptions<RouterOutput[K]>>;

type ReactiveQueryInput<T> =
  | Ref<T>
  | ComputedRef<T>
  | (() => T)
  | (undefined extends T ? undefined : never);

export const trpcKey = <K extends ProcedureName>(
  path: K,
  input: RouterInput[K],
): readonly [K, RouterInput[K]] => [path, input];

export const trpcQueryOptions = <K extends ProcedureName>(path: K, input: RouterInput[K]) => {
  const caller: unknown = trpcClient[path];
  if (!isQueryCaller<K>(caller)) {
    throw new Error(`tRPC procedure "${path}" is not a query`);
  }
  return {
    queryKey: trpcKey(path, input),
    queryFn: (): Promise<RouterOutput[K]> => caller.query(input),
  };
};

export const useTRPCQuery = <K extends ProcedureName>(
  path: K,
  input: ReactiveQueryInput<RouterInput[K]>,
  options?: MaybeRefOrGetter<ExtraQueryOptions<K>>,
) =>
  useQuery(
    computed(() => ({
      ...trpcQueryOptions(path, toValue(input)),
      ...toValue(options),
    })),
  );

export const useTRPCMutation = <K extends ProcedureName>(
  path: K,
  options?: UseMutationOptions<RouterOutput[K], Error, RouterInput[K]>,
) => {
  const caller: unknown = trpcClient[path];
  if (!isMutateCaller<K>(caller)) {
    throw new Error(`tRPC procedure "${path}" is not a mutation`);
  }
  return useMutation(
    computed(() => ({
      mutationFn: (input: RouterInput[K]): Promise<RouterOutput[K]> => caller.mutate(input),
      ...toValue(options),
    })),
  );
};

const invalidationKey = (
  path: ProcedureName,
  input: unknown,
): [ProcedureName] | [ProcedureName, unknown] => (input === undefined ? [path] : [path, input]);

export const useTRPCUtils = () => {
  const queryClient = useQueryClient();
  return {
    invalidate: <K extends ProcedureName>(path: K, input?: RouterInput[K]) =>
      queryClient.invalidateQueries({
        queryKey: invalidationKey(path, input),
      }),
    reset: (path: ProcedureName) => queryClient.resetQueries({ queryKey: [path] }),
    fetch: <K extends ProcedureName>(path: K, input: RouterInput[K]) =>
      queryClient.query(trpcQueryOptions(path, input)),
    setData: <K extends ProcedureName>(
      path: K,
      input: RouterInput[K],
      updater:
        | RouterOutput[K]
        | ((oldData: RouterOutput[K] | undefined) => RouterOutput[K] | undefined),
    ) => queryClient.setQueryData(trpcKey(path, input), updater),
    clear: () => {
      queryClient.clear();
    },
  };
};
