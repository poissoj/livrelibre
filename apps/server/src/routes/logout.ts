import type { Context } from "hono";

import { ANONYMOUS, clearSessionCookie } from "@server/auth";
import { logger } from "@server/utils/logger";

export const logoutRoute = (c: Context) => {
  logger.info("Logout");
  clearSessionCookie(c);
  return c.json(ANONYMOUS);
};
