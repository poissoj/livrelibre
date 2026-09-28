import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/vue-query";
import { type MaybeRefOrGetter, computed, toValue } from "vue";

import { type RouterInput, type RouterOutput, trpcClient } from "./trpc";

type ProcedureName = keyof RouterInput;

type QueryCaller = { query: (input: unknown) => Promise<unknown> };
type MutateCaller = { mutate: (input: unknown) => Promise<unknown> };

type ExtraQueryOptions<K extends ProcedureName> = Partial<
  UseQueryOptions<RouterOutput[K]>
>;

export const trpcKey = <K extends ProcedureName>(
  path: K,
  input: RouterInput[K],
): readonly [K, RouterInput[K]] => [path, input];

export const trpcQueryOptions = <K extends ProcedureName>(
  path: K,
  input: RouterInput[K],
) => {
  const caller = trpcClient[path] as unknown as QueryCaller;
  return {
    queryKey: trpcKey(path, input),
    queryFn: (): Promise<RouterOutput[K]> =>
      caller.query(input) as Promise<RouterOutput[K]>,
  };
};

export const useTRPCQuery = <K extends ProcedureName>(
  path: K,
  input: MaybeRefOrGetter<RouterInput[K]>,
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
  const caller = trpcClient[path] as unknown as MutateCaller;
  return useMutation(
    computed(() => ({
      mutationFn: (input: RouterInput[K]): Promise<RouterOutput[K]> =>
        caller.mutate(input) as Promise<RouterOutput[K]>,
      ...toValue(options),
    })),
  );
};

const invalidationKey = (
  path: ProcedureName,
  input: unknown,
): [ProcedureName] | [ProcedureName, unknown] =>
  input === undefined ? [path] : [path, input];

export const useTRPCUtils = () => {
  const queryClient = useQueryClient();
  return {
    invalidate: <K extends ProcedureName>(path: K, input?: RouterInput[K]) =>
      queryClient.invalidateQueries({
        queryKey: invalidationKey(path, input),
      }),
    reset: (path: ProcedureName) =>
      queryClient.resetQueries({ queryKey: [path] }),
    fetch: <K extends ProcedureName>(path: K, input: RouterInput[K]) =>
      queryClient.query(trpcQueryOptions(path, input)),
    setData: <K extends ProcedureName>(
      path: K,
      input: RouterInput[K],
      updater:
        | RouterOutput[K]
        | ((
            oldData: RouterOutput[K] | undefined,
          ) => RouterOutput[K] | undefined),
    ) => queryClient.setQueryData(trpcKey(path, input), updater),
    clear: () => {
      queryClient.clear();
    },
  };
};
