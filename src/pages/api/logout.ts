import { withIronSessionApiRoute } from "iron-session/next";
import type { NextApiHandler } from "next";

import { type User, sessionOptions } from "@/lib/session";
import { logger } from "@/utils/logger";

const logoutRoute: NextApiHandler = (req, res) => {
  logger.info("Logout", { user: req.session.user });
  req.session.destroy();
  const user: User = { name: "", role: "anonymous" };
  res.json(user);
};

export default withIronSessionApiRoute(logoutRoute, sessionOptions);
