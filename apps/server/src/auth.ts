import { getCookie, setCookie } from "hono/cookie";
import type { Context, Next } from "hono";
import { sign, verify } from "hono/jwt";

import { env } from "./env";

const COOKIE_NAME = "livreLibre";
const ALGORITHM = "HS256";

export type User = {
  name: string;
  id: number;
  role: "admin" | "guest" | "anonymous";
};

export const ANONYMOUS: User = { name: "", id: 0, role: "anonymous" };

const signSession = async (user: User): Promise<string> =>
  await sign(
    { sub: String(user.id), name: user.name, role: user.role },
    env.SESSION_SECRET,
    ALGORITHM,
  );

const verifySession = async (token: string): Promise<User | null> => {
  try {
    const payload = await verify(token, env.SESSION_SECRET, ALGORITHM);
    if (
      typeof payload.name !== "string" ||
      typeof payload.sub !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }
    return {
      name: payload.name,
      id: Number(payload.sub),
      role: payload.role as User["role"],
    };
  } catch {
    return null;
  }
};

export const setSessionCookie = async (c: Context, user: User) => {
  const token = await signSession(user);
  setCookie(c, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
};

export const clearSessionCookie = (c: Context) => {
  setCookie(c, COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
};

export const authMiddleware = async (c: Context, next: Next) => {
  const token = getCookie(c, COOKIE_NAME);
  const user = token ? await verifySession(token) : null;
  c.set("user", user ?? ANONYMOUS);
  await next();
};
