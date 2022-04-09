import type { ReactChild, ReactPortal } from "react";

export type StrictReactFragment = Iterable<StrictReactNode>;

export type StrictReactNode =
  | ReactChild
  | StrictReactFragment
  | ReactPortal
  | boolean
  | null
  | undefined;
