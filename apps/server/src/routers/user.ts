import { ERROR_CODES } from "@livrelibre/shared/errors";
import { zId, zPassword } from "@livrelibre/shared/validation";
import {
  changePassword,
  createUser,
  deleteUser,
  getUsers,
  resetUserPassword,
  updateUser,
} from "@server/server/users";
import { logger } from "@server/utils/logger";
import { z } from "zod";

import { adminProcedure, authProcedure } from "../procedures";
import { procedure } from "../trpc";

export const userRoutes = {
  user: procedure.query(({ ctx }) => ctx.user),
  changePassword: authProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1),
        newPassword: zPassword,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await changePassword(ctx.user.id, input.currentPassword, input.newPassword);
      logger.info("Password changed", { user: ctx.user });
    }),
  users: adminProcedure.query(getUsers),
  createUser: adminProcedure
    .input(
      z.object({
        name: z.string().trim().min(1, ERROR_CODES.INVALID_NAME),
        password: zPassword,
        role: z.enum(["admin", "cashier"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await createUser(input.name, input.password, input.role);
      logger.info("User created", { user: ctx.user, name: input.name, role: input.role });
    }),
  updateUser: adminProcedure
    .input(
      z.object({
        id: zId,
        name: z.string().trim().min(1, ERROR_CODES.INVALID_NAME),
        role: z.enum(["admin", "cashier"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await updateUser(input.id, input.name, input.role);
      logger.info("User updated", { user: ctx.user, userId: input.id, role: input.role });
    }),
  resetUserPassword: adminProcedure
    .input(z.object({ id: zId, password: zPassword }))
    .mutation(async ({ ctx, input }) => {
      await resetUserPassword(input.id, input.password);
      logger.info("User password reset", { user: ctx.user, userId: input.id });
    }),
  deleteUser: adminProcedure.input(zId).mutation(async ({ ctx, input }) => {
    await deleteUser(input, ctx.user.id);
    logger.info("User deleted", { user: ctx.user, userId: input });
  }),
};
