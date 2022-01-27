import { sessionOptions } from "@/lib/session";
import { getDb } from "@/server/database";
import { withIronSessionApiRoute } from "iron-session/next";
import type { NextApiHandler } from "next";
import { z } from "zod";

const credentialsSchema = z.object({
  username: z.string(),
  password: z.string(),
});

type DBUser = { name: string; password: string; role: "admin" | "guest" };

const loginRoute: NextApiHandler = async (req, res) => {
  try {
    const { username, password } = credentialsSchema.parse(req.body);
    if (!username) {
      res.status(400).json({ error: "Empty username" });
      return;
    }
    const db = await getDb();
    const dbUser = await db
      .collection<DBUser>("users")
      .findOne({ name: username });

    if (dbUser && password === dbUser.password) {
      const user = { name: dbUser.name, role: dbUser.role };
      req.session.user = user;
      await req.session.save();
      res.json(user);
      return;
    }
    res.status(401).json({ error: "Invalid credentials" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error processing credentials" });
  }
};

export default withIronSessionApiRoute(loginRoute, sessionOptions);
