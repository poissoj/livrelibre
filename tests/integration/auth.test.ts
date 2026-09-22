import bcrypt from "bcrypt";
import { sign } from "hono/jwt";
import { beforeEach, describe, expect, it } from "vitest";

import { app } from "@livrelibre/server/app";
import { db } from "@livrelibre/server/db/database";
import { users } from "@livrelibre/shared/schema";

import { truncateAll } from "./helpers";

const ALGORITHM = "HS256";
const SECRET = process.env.SESSION_SECRET;
if (!SECRET) {
  throw new Error("SESSION_SECRET is required to run auth tests");
}

const seedUserWithPassword = async (name: string, password: string) => {
  const hash = await bcrypt.hash(password, 4);
  await db.insert(users).values({ name, hash, role: "admin" });
};

const signToken = (payload: {
  sub: string;
  name: string;
  role: string;
  exp: number;
}) => sign(payload, SECRET, ALGORITHM);

const exportWithCookie = (token: string) =>
  app.request("/api/export", { headers: { cookie: `livreLibre=${token}` } });

describe("session", () => {
  beforeEach(truncateAll);

  it("sets a persistent session cookie on login", async () => {
    await seedUserWithPassword("admin", "secret");

    const res = await app.request("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "secret" }),
    });

    expect(res.status).toBe(200);
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("livreLibre=");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Lax");
    expect(setCookie).toContain("Max-Age=604800");
    expect(setCookie).not.toContain("Secure");
  });

  it("accepts a valid, unexpired token", async () => {
    const token = await signToken({
      sub: "1",
      name: "admin",
      role: "admin",
      exp: Math.floor(Date.now() / 1000) + 60,
    });

    const res = await exportWithCookie(token);
    expect(res.status).toBe(200);
  });

  it("treats an expired token as anonymous", async () => {
    const token = await signToken({
      sub: "1",
      name: "admin",
      role: "admin",
      exp: Math.floor(Date.now() / 1000) - 60,
    });

    const res = await exportWithCookie(token);
    expect(res.status).toBe(401);
  });

  it("treats a token with an invalid role as anonymous", async () => {
    const token = await signToken({
      sub: "1",
      name: "admin",
      role: "hacker",
      exp: Math.floor(Date.now() / 1000) + 60,
    });

    const res = await exportWithCookie(token);
    expect(res.status).toBe(401);
  });
});
