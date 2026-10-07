import { initTRPC } from "@trpc/server";
import { ZodError } from "zod";

import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    const cause = error.cause;
    return {
      ...shape,
      message:
        error.code === "INTERNAL_SERVER_ERROR" ? "Une erreur interne est survenue" : shape.message,
      data: {
        ...shape.data,
        issues:
          cause instanceof ZodError
            ? cause.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
              }))
            : undefined,
      },
    };
  },
});

export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;
