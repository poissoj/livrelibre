import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { z } from "zod";

import { ERROR_CODES } from "@livrelibre/shared/errors";
import { users } from "@livrelibre/shared/schema";

import { setSessionCookie } from "@server/auth";
import { db } from "@server/db/database";
import { logError } from "@server/utils/logError";
import { logger } from "@server/utils/logger";

const credentialsSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const loginRoute = async (c: Context) => {
  let username: string | undefined;
  try {
    const credentials = credentialsSchema.parse(await c.req.json());
    username = credentials.username;
    const { password } = credentials;
    if (!username) {
      logger.info("Invalid login attempt - no username");
      return c.json({ error: ERROR_CODES.MISSING_USERNAME }, 400);
    }
    const dbUser = await db.query.users.findFirst({
      where: eq(users.name, username),
    });
    if (!dbUser) {
      logger.info("User not found", { username });
      return c.json({ error: ERROR_CODES.INVALID_CREDENTIALS }, 401);
    }
    const passwordMatches = await bcrypt.compare(password, dbUser.hash);
    if (passwordMatches) {
      const user = { name: dbUser.name, role: dbUser.role, id: dbUser.id };
      await setSessionCookie(c, user);
      logger.info("Login successful", { user });
      return c.json(user);
    }
    logger.info("Invalid credentials", { username });
    return c.json({ error: ERROR_CODES.INVALID_CREDENTIALS }, 401);
  } catch (error) {
    logError("login", error, { username });
    return c.json({ error: ERROR_CODES.LOGIN_ERROR }, 500);
  }
};
