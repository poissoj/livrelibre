import {
  type UseMutationOptions,
  type UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/vue-query";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { type MaybeRefOrGetter, computed, toValue } from "vue";

import type { AppRouter } from "@livrelibre/server/router";

import { trpcClient } from "./trpc";

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutputMap = inferRouterOutputs<AppRouter>;

type ProcedureName = keyof RouterInput;

type QueryCaller = { query: (input: unknown) => Promise<unknown> };
type MutateCaller = { mutate: (input: unknown) => Promise<unknown> };

type ExtraQueryOptions<K extends ProcedureName> = Partial<
  UseQueryOptions<RouterOutputMap[K]>
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
    queryFn: (): Promise<RouterOutputMap[K]> =>
      caller.query(input) as Promise<RouterOutputMap[K]>,
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
  options?: UseMutationOptions<RouterOutputMap[K], Error, RouterInput[K]>,
) => {
  const caller = trpcClient[path] as unknown as MutateCaller;
  return useMutation(
    computed(() => ({
      mutationFn: (input: RouterInput[K]): Promise<RouterOutputMap[K]> =>
        caller.mutate(input) as Promise<RouterOutputMap[K]>,
      ...toValue(options),
    })),
  );
};

export const useTRPCUtils = () => {
  const queryClient = useQueryClient();
  return {
    invalidate: (path: ProcedureName, input?: unknown) =>
      queryClient.invalidateQueries({
        queryKey: input === undefined ? [path] : [path, input],
      }),
    reset: (path: ProcedureName) =>
      queryClient.resetQueries({ queryKey: [path] }),
    fetch: <K extends ProcedureName>(path: K, input: RouterInput[K]) =>
      queryClient.query(trpcQueryOptions(path, input)),
    setData: <K extends ProcedureName>(
      path: K,
      input: RouterInput[K],
      data: RouterOutputMap[K],
    ) => queryClient.setQueryData(trpcKey(path, input), data),
    clear: () => {
      queryClient.clear();
    },
  };
};
