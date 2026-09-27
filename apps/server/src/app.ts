import { serveStatic } from "@hono/node-server/serve-static";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { fileURLToPath } from "node:url";

import { authMiddleware } from "./auth";
import { createContext } from "./context";
import { appRouter } from "./router";
import { bookRoute } from "./routes/book";
import { exportRoute } from "./routes/export";
import { finalizeImportRoute } from "./routes/finalizeImport";
import { importFileRoute } from "./routes/importFile";
import { loginRoute } from "./routes/login";
import { logoutRoute } from "./routes/logout";
import { logger } from "./utils/logger";

export const app = new Hono();

const MAX_IMPORT_FILE_SIZE = 10 * 1024 * 1024;

// Security headers
app.use("*", async (c, next) => {
  await next();
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("Permissions-Policy", "interest-cohort=()");
  c.header("Referrer-Policy", "no-referrer-when-downgrade");
  c.header(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );
});

// Authentication (JWT from cookie)
app.use("/api/*", authMiddleware);

// Limit the size of import payloads (authenticated users only)
app.use("/api/importFile", bodyLimit({ maxSize: MAX_IMPORT_FILE_SIZE }));
app.use("/api/finalizeImport", bodyLimit({ maxSize: MAX_IMPORT_FILE_SIZE }));

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
    onError({ path, type, error }) {
      if (error.code !== "INTERNAL_SERVER_ERROR") {
        return;
      }
      const cause = error.cause;
      logger.error(`tRPC internal error on ${path ?? "unknown"}`, {
        path,
        type,
        message: error.message,
        stack: cause instanceof Error ? cause.stack : error.stack,
      });
    },
  }),
);

// Production static serving (SPA + API in a single process)
if (process.env.NODE_ENV === "production") {
  const distRoot = fileURLToPath(new URL("../../web/dist", import.meta.url));
  logger.info(`Serving SPA from ${distRoot}`);
  app.use(
    "*",
    serveStatic({
      root: distRoot,
      rewriteRequestPath: (path) =>
        path.startsWith("/api/") || path.includes(".") ? path : "/index.html",
    }),
  );
}
