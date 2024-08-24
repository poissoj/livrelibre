import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { getIronSession } from "iron-session";
import type { NextApiHandler } from "next";
import { z } from "zod";

import { db } from "@/db/database";
import { users } from "@/db/schema";
import { type SessionData, sessionOptions } from "@/lib/session";
import { logger } from "@/utils/logger";

const credentialsSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const loginRoute: NextApiHandler = async (req, res) => {
  try {
    const { username, password } = credentialsSchema.parse(req.body);
    if (!username) {
      logger.info("Invalid login attempt - no username");
      res.status(400).json({ error: "Empty username" });
      return;
    }
    const dbUser = await db.query.users.findFirst({
      where: eq(users.name, username),
    });
    if (!dbUser) {
      logger.info("User not found", { username });
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const passwordMatches = await bcrypt.compare(password, dbUser.hash);

    if (passwordMatches) {
      const user = { name: dbUser.name, role: dbUser.role, id: dbUser.id };
      const session = await getIronSession<SessionData>(
        req,
        res,
        sessionOptions,
      );
      session.user = user;
      await session.save();
      logger.info("Login successful", { user });
      res.json(user);
      return;
    }
    logger.info("Invalid credentials", { username });
    res.status(401).json({ error: "Invalid credentials" });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Error processing credentials" });
  }
};

export default loginRoute;
