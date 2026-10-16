import { TRPCError } from "@trpc/server";

import { middleware, procedure } from "./trpc";

const checkAuth = middleware(({ ctx, next }) => {
  if (ctx.user.role === "anonymous") {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next();
});

export const authProcedure = procedure.use(checkAuth);

export const adminProcedure = authProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next();
});
