import type { inferAsyncReturnType } from "@trpc/server";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { sessionOptions, User } from "@/lib/session";
import { getIronSession } from "iron-session";

export const createContext = async (opts?: CreateNextContextOptions) => {
  const getUser = async (): Promise<User> => {
    if (!opts) {
      return { name: "", role: "ssg" };
    }
    const session = await getIronSession(opts.req, opts.res, sessionOptions);
    if (session.user) {
      return session.user;
    }
    return { name: "", role: "anonymous" };
  };

  const user = await getUser();

  return {
    user,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;
