import { withIronSessionApiRoute } from "iron-session/next";
import type { NextApiHandler } from "next";

import { User, sessionOptions } from "@/lib/session";

const logoutRoute: NextApiHandler = (req, res) => {
  req.session.destroy();
  const user: User = { name: "", role: "anonymous" };
  res.json(user);
};

export default withIronSessionApiRoute(logoutRoute, sessionOptions);
