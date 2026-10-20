import { ERROR_CODES } from "@livrelibre/shared/errors";
import { zPaymentMethodCode } from "@livrelibre/shared/paymentMethod";
import {
  createPaymentMethod,
  deletePaymentMethod,
  getPaymentMethods,
  reorderPaymentMethods,
  updatePaymentMethod,
} from "@server/server/paymentMethods";
import { logger } from "@server/utils/logger";
import { z } from "zod";

import { adminProcedure, authProcedure } from "../procedures";

export const paymentMethodRoutes = {
  paymentMethods: authProcedure.query(getPaymentMethods),
  createPaymentMethod: adminProcedure
    .input(
      z.object({
        code: zPaymentMethodCode,
        label: z.string().trim().min(1, ERROR_CODES.INVALID_NAME),
        position: z.number().int().nonnegative().optional(),
        active: z.boolean().optional(),
        isDefault: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await createPaymentMethod(input);
      logger.info("Payment method created", { user: ctx.user, code: input.code });
    }),
  updatePaymentMethod: adminProcedure
    .input(
      z.object({
        code: zPaymentMethodCode,
        label: z.string().trim().min(1, ERROR_CODES.INVALID_NAME).optional(),
        position: z.number().int().nonnegative().optional(),
        active: z.boolean().optional(),
        isDefault: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { code, ...rest } = input;
      await updatePaymentMethod(code, rest);
      logger.info("Payment method updated", { user: ctx.user, code });
    }),
  deletePaymentMethod: adminProcedure.input(zPaymentMethodCode).mutation(async ({ ctx, input }) => {
    await deletePaymentMethod(input);
    logger.info("Payment method deleted", { user: ctx.user, code: input });
  }),
  reorderPaymentMethods: adminProcedure
    .input(
      z.object({
        codes: z.array(z.string().trim().min(1, ERROR_CODES.INVALID_PAYMENT_METHOD)).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await reorderPaymentMethods(input.codes);
      logger.info("Payment methods reordered", { user: ctx.user, count: input.codes.length });
    }),
};
