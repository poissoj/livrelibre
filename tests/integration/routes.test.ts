import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";

import { app } from "@livrelibre/server/app";
import { db } from "@livrelibre/server/db/database";
import { items, users } from "@livrelibre/shared/schema";

import { seedItem, truncateAll } from "./helpers";

const seedUserWithPassword = async (name: string, password: string) => {
  const hash = await bcrypt.hash(password, 4);
  const rows = await db
    .insert(users)
    .values({ name, hash, role: "admin" })
    .returning();
  return rows[0];
};

const login = async (username: string, password: string) => {
  const res = await app.request("/api/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const cookie = res.headers.get("set-cookie")?.split(";")[0] ?? "";
  return { res, cookie };
};

const authCookie = async () => {
  await seedUserWithPassword("admin", "secret");
  const { cookie } = await login("admin", "secret");
  return cookie;
};

describe("REST routes", () => {
  beforeEach(truncateAll);

  describe("POST /api/login", () => {
    it("sets a session cookie on valid credentials", async () => {
      await seedUserWithPassword("admin", "secret");
      const { res } = await login("admin", "secret");

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toMatchObject({
        name: "admin",
        role: "admin",
      });
      expect(res.headers.get("set-cookie")).toContain("livreLibre=");
    });

    it("rejects a wrong password", async () => {
      await seedUserWithPassword("admin", "secret");
      const { res } = await login("admin", "wrong");
      expect(res.status).toBe(401);
    });

    it("rejects an unknown user", async () => {
      const { res } = await login("ghost", "secret");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/logout", () => {
    it("clears the session cookie", async () => {
      const res = await app.request("/api/logout", { method: "POST" });
      expect(res.status).toBe(200);
      expect(res.headers.get("set-cookie")).toContain("livreLibre=");
    });
  });

  describe("GET /api/export", () => {
    it("rejects anonymous users", async () => {
      const res = await app.request("/api/export");
      expect(res.status).toBe(401);
    });

    it("returns the stock as CSV for an authenticated user", async () => {
      const cookie = await authCookie();
      await seedItem({ isbn: "9780000000001", amount: 3 });

      const res = await app.request("/api/export", { headers: { cookie } });
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("text/csv");

      const csv = await res.text();
      expect(csv).toContain("Catégorie,Titre");
      expect(csv).toContain("9780000000001");
    });
  });

  describe("GET /api/book/:isbn", () => {
    it("rejects anonymous users", async () => {
      const res = await app.request("/api/book/9780000000001");
      expect(res.status).toBe(401);
    });

    it("rejects an invalid isbn", async () => {
      const cookie = await authCookie();
      const res = await app.request("/api/book/abc", { headers: { cookie } });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/finalizeImport", () => {
    it("rejects anonymous users", async () => {
      const res = await app.request("/api/finalizeImport", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "[]",
      });
      expect(res.status).toBe(401);
    });

    it("imports new books for an authenticated user", async () => {
      const cookie = await authCookie();
      const res = await app.request("/api/finalizeImport", {
        method: "POST",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify([
          {
            EAN: "9780000000009",
            TITRE: "Titre importé",
            AUTEUR: "Auteur",
            EDITEUR: "Éditeur",
            DISTRIBUTEUR: "Distributeur",
            PRIX: 12.5,
            QTE: 2,
          },
        ]),
      });

      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ status: "Import ok" });

      const row = await db.query.items.findFirst({
        where: eq(items.isbn, "9780000000009"),
      });
      expect(row?.amount).toBe(2);
    });
  });

  describe("POST /api/importFile", () => {
    it("rejects anonymous users", async () => {
      const res = await app.request("/api/importFile", {
        method: "POST",
        body: new FormData(),
      });
      expect(res.status).toBe(401);
    });

    it("returns 400 when no file is provided", async () => {
      const cookie = await authCookie();
      const res = await app.request("/api/importFile", {
        method: "POST",
        headers: { cookie },
        body: new FormData(),
      });
      expect(res.status).toBe(400);
    });
  });
});
