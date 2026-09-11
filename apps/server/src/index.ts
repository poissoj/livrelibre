import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { fileURLToPath } from "node:url";

import { authMiddleware } from "./auth";
import { createContext } from "./context";
import { env } from "./env";
import { appRouter } from "./router";
import { bookRoute } from "./routes/book";
import { exportRoute } from "./routes/export";
import { finalizeImportRoute } from "./routes/finalizeImport";
import { importFileRoute } from "./routes/importFile";
import { loginRoute } from "./routes/login";
import { logoutRoute } from "./routes/logout";

const app = new Hono();

// Security headers
app.use("*", async (c, next) => {
  await next();
  c.header("X-Content-Type-Options", "nosniff");
  c.header("Permissions-Policy", "interest-cohort=()");
  c.header("Referrer-Policy", "no-referrer-when-downgrade");
  c.header(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
});

// Authentication (JWT from cookie)
app.use("/api/*", authMiddleware);

// REST routes
app.post("/api/login", loginRoute);
app.post("/api/logout", logoutRoute);
app.get("/api/book/:isbn", bookRoute);
app.get("/api/export", exportRoute);
app.post("/api/importFile", importFileRoute);
app.post("/api/finalizeImport", finalizeImportRoute);

// tRPC
app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
  }),
);

// Production static serving (SPA + API in a single process)
if (process.env.NODE_ENV === "production") {
  const distRoot = fileURLToPath(new URL("../../web/dist", import.meta.url));
  console.log(`Serving SPA from ${distRoot}`);
  app.use(
    "*",
    serveStatic({
      root: distRoot,
      rewriteRequestPath: (path) =>
        path.startsWith("/api/") || path.includes(".") ? path : "/index.html",
    }),
  );
}

const port = Number(env.PORT ?? 3001);
console.log(`Livre Libre server listening on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
