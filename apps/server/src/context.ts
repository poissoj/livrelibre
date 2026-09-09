import type { Context as HonoContext } from "hono";

import { ANONYMOUS, type User } from "./auth";

export type Context = {
  user: User;
};

export const createContext = (_opts: unknown, c: HonoContext): Context => ({
  user: (c.get("user") as User | undefined) ?? ANONYMOUS,
});
