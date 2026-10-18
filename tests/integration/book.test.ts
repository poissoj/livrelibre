import { type Server, createServer } from "node:http";

import { appRouter } from "@livrelibre/server/router";
import { env } from "@server/env";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const FOUND_ISBN = "9780000000001";
const EMPTY_ISBN = "9780000000002";
const REMOTE_404_ISBN = "9780000000003";

const ORIGINAL_ISBN_SEARCH_URL = env.ISBN_SEARCH_URL;

const caller = appRouter.createCaller({ user: { id: 1, name: "admin", role: "admin" } });

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

describe("bookData", () => {
  it("returns the book data when the page has details", async () => {
    await expect(caller.bookData(FOUND_ISBN)).resolves.toEqual({
      title: "Titre trouvé",
      author: "Auteur trouvé",
      publisher: "Éditeur trouvé",
    });
  });

  it("throws NOT_FOUND when the page has no book details", async () => {
    await expect(caller.bookData(EMPTY_ISBN)).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "BOOK_NOT_FOUND",
    });
  });

  it("throws NOT_FOUND when the remote responds with 404", async () => {
    await expect(caller.bookData(REMOTE_404_ISBN)).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: "BOOK_NOT_FOUND",
    });
  });

  it("throws BAD_GATEWAY on a transport error", async () => {
    env.ISBN_SEARCH_URL = "http://127.0.0.1:9/";
    try {
      await expect(caller.bookData(FOUND_ISBN)).rejects.toMatchObject({
        code: "BAD_GATEWAY",
        message: "BOOK_FETCH_FAILED",
      });
    } finally {
      env.ISBN_SEARCH_URL = baseUrl;
    }
  });
});
