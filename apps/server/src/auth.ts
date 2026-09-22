import type { Context, Next } from "hono";
import { getCookie, setCookie } from "hono/cookie";
import { sign, verify } from "hono/jwt";
import { z } from "zod";

import { env } from "./env";

const COOKIE_NAME = "livreLibre";
const ALGORITHM = "HS256";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

export type User = {
  name: string;
  id: number;
  role: "admin" | "guest" | "anonymous";
};

export const ANONYMOUS: User = { name: "", id: 0, role: "anonymous" };

const sessionSchema = z.object({
  name: z.string(),
  sub: z.coerce.number(),
  role: z.enum(["admin", "guest"]),
});

const signSession = async (user: User): Promise<string> => {
  const now = Math.floor(Date.now() / 1000);
  return await sign(
    {
      sub: String(user.id),
      name: user.name,
      role: user.role,
      iat: now,
      exp: now + SESSION_TTL_SECONDS,
    },
    env.SESSION_SECRET,
    ALGORITHM,
  );
};

const verifySession = async (token: string): Promise<User | null> => {
  try {
    const payload = await verify(token, env.SESSION_SECRET, ALGORITHM);
    const parsed = sessionSchema.safeParse(payload);
    if (!parsed.success) {
      return null;
    }
    return {
      name: parsed.data.name,
      id: parsed.data.sub,
      role: parsed.data.role,
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
    secure: IS_PRODUCTION,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
};

export const clearSessionCookie = (c: Context) => {
  setCookie(c, COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: IS_PRODUCTION,
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
