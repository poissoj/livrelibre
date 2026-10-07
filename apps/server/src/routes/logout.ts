import { ANONYMOUS, type User, clearSessionCookie } from "@server/auth";
import { logger } from "@server/utils/logger";
import type { Context } from "hono";

export const logoutRoute = (c: Context) => {
  logger.info("Logout", { user: c.get("user") as User });
  clearSessionCookie(c);
  return c.json(ANONYMOUS);
};
