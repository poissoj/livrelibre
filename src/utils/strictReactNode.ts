import type { ReactChild, ReactPortal } from "react";

export type StrictReactFragment =
  | {
      key?: string | number | null;
      ref?: null;
      props?: {
        children?: StrictReactNode;
      };
    }
  | Iterable<StrictReactNode>;

export type StrictReactNode =
  | ReactChild
  | StrictReactFragment
  | ReactPortal
  | boolean
  | null
  | undefined;
