import bcrypt from "bcrypt";
import { type Server, createServer } from "node:http";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { app } from "@livrelibre/server/app";
import { db } from "@livrelibre/server/db/database";
import { users } from "@livrelibre/shared/schema";

import { env } from "@server/env";

import { truncateAll } from "./helpers";

const FOUND_ISBN = "9780000000001";
const EMPTY_ISBN = "9780000000002";
const REMOTE_404_ISBN = "9780000000003";

const ORIGINAL_ISBN_SEARCH_URL = env.ISBN_SEARCH_URL;

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  server = createServer((req, res) => {
    const isbn = req.url?.slice(1) ?? "";
    if (isbn === FOUND_ISBN) {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(
        `<div class="product-details">
           <span itemprop="name">Titre trouvé</span>
           <span itemprop="author">Auteur trouvé</span>
           <span itemprop="publisher">Éditeur trouvé</span>
         </div>`,
      );
      return;
    }
    if (isbn === REMOTE_404_ISBN) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end("<html><body>Aucun résultat</body></html>");
  });
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;
  baseUrl = `http://127.0.0.1:${String(port)}/`;
  env.ISBN_SEARCH_URL = baseUrl;
});

afterAll(async () => {
  env.ISBN_SEARCH_URL = ORIGINAL_ISBN_SEARCH_URL;
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
});

const seedUserWithPassword = async (name: string, password: string) => {
  const hash = await bcrypt.hash(password, 4);
  const rows = await db
    .insert(users)
    .values({ name, hash, role: "admin" })
    .returning();
  return rows[0];
};

const authCookie = async () => {
  await seedUserWithPassword("admin", "secret");
  const res = await app.request("/api/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "secret" }),
  });
  return res.headers.get("set-cookie")?.split(";")[0] ?? "";
};

describe("GET /api/book/:isbn", () => {
  beforeEach(truncateAll);

  it("returns the book data when the page has details", async () => {
    const cookie = await authCookie();
    const res = await app.request(`/api/book/${FOUND_ISBN}`, {
      headers: { cookie },
    });

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      title: "Titre trouvé",
      author: "Auteur trouvé",
      publisher: "Éditeur trouvé",
    });
  });

  it("returns 404 when the page has no book details", async () => {
    const cookie = await authCookie();
    const res = await app.request(`/api/book/${EMPTY_ISBN}`, {
      headers: { cookie },
    });

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({ error: "BOOK_NOT_FOUND" });
  });

  it("returns 404 when the remote responds with 404", async () => {
    const cookie = await authCookie();
    const res = await app.request(`/api/book/${REMOTE_404_ISBN}`, {
      headers: { cookie },
    });

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({ error: "BOOK_NOT_FOUND" });
  });

  it("returns 500 on a transport error", async () => {
    const cookie = await authCookie();
    env.ISBN_SEARCH_URL = "http://127.0.0.1:9/";
    try {
      const res = await app.request(`/api/book/${FOUND_ISBN}`, {
        headers: { cookie },
      });

      expect(res.status).toBe(500);
      await expect(res.json()).resolves.toEqual({ error: "BOOK_FETCH_FAILED" });
    } finally {
      env.ISBN_SEARCH_URL = baseUrl;
    }
  });
});
