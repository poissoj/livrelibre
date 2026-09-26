import type { useTRPCUtils } from "./query";

type TRPCUtils = ReturnType<typeof useTRPCUtils>;

const CART_RELATED = [
  "cart",
  "bookmarks",
  "quicksearch",
  "items",
  "advancedSearch",
] as const;

export const refreshCartRelated = (utils: TRPCUtils): Promise<unknown[]> =>
  Promise.all(CART_RELATED.map((path) => utils.invalidate(path)));
