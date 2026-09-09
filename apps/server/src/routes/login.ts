import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import type { Context } from "hono";
import { z } from "zod";

import { users } from "@livrelibre/shared/schema";

import { setSessionCookie } from "@server/auth";
import { db } from "@server/db/database";
import { logger } from "@server/utils/logger";

const credentialsSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const loginRoute = async (c: Context) => {
  try {
    const { username, password } = credentialsSchema.parse(await c.req.json());
    if (!username) {
      logger.info("Invalid login attempt - no username");
      return c.json({ error: "Empty username" }, 400);
    }
    const dbUser = await db.query.users.findFirst({
      where: eq(users.name, username),
    });
    if (!dbUser) {
      logger.info("User not found", { username });
      return c.json({ error: "Invalid credentials" }, 401);
    }
    const passwordMatches = await bcrypt.compare(password, dbUser.hash);
    if (passwordMatches) {
      const user = { name: dbUser.name, role: dbUser.role, id: dbUser.id };
      await setSessionCookie(c, user);
      logger.info("Login successful", { user });
      return c.json(user);
    }
    logger.info("Invalid credentials", { username });
    return c.json({ error: "Invalid credentials" }, 401);
  } catch (error) {
    logger.error(error);
    return c.json({ error: "Error processing credentials" }, 500);
  }
};
