import { getIronSession } from "iron-session";
import type { NextApiHandler } from "next";

import { type SessionData, type User, sessionOptions } from "@/lib/session";
import { logger } from "@/utils/logger";

const logoutRoute: NextApiHandler = async (req, res) => {
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  logger.info("Logout", { user: session.user });
  session.destroy();
  const user: User = { name: "", role: "anonymous", id: 0 };
  res.json(user);
};

export default logoutRoute;
