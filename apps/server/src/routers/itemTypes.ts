import { ERROR_CODES } from "@livrelibre/shared/errors";
import { TVAValues, zItemType } from "@livrelibre/shared/item";
import {
  createItemType,
  deleteItemType,
  getItemTypes,
  reorderItemTypes,
  updateItemType,
} from "@server/server/itemTypes";
import { logger } from "@server/utils/logger";
import { z } from "zod";

import { adminProcedure, authProcedure } from "../procedures";

export const itemTypeRoutes = {
  itemTypes: authProcedure.query(getItemTypes),
  createItemType: adminProcedure
    .input(
      z.object({
        code: zItemType,
        label: z.string().trim().min(1, ERROR_CODES.INVALID_NAME),
        tva: z.enum(TVAValues),
        position: z.number().int().nonnegative().optional(),
        active: z.boolean().optional(),
        isDefault: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await createItemType(input);
      logger.info("Item type created", { user: ctx.user, code: input.code });
    }),
  updateItemType: adminProcedure
    .input(
      z.object({
        code: zItemType,
        label: z.string().trim().min(1, ERROR_CODES.INVALID_NAME).optional(),
        tva: z.enum(TVAValues).optional(),
        position: z.number().int().nonnegative().optional(),
        active: z.boolean().optional(),
        isDefault: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { code, ...rest } = input;
      await updateItemType(code, rest);
      logger.info("Item type updated", { user: ctx.user, code });
    }),
  deleteItemType: adminProcedure.input(zItemType).mutation(async ({ ctx, input }) => {
    await deleteItemType(input);
    logger.info("Item type deleted", { user: ctx.user, code: input });
  }),
  reorderItemTypes: adminProcedure
    .input(
      z.object({ codes: z.array(z.string().trim().min(1, ERROR_CODES.INVALID_ITEM_TYPE)).min(1) }),
    )
    .mutation(async ({ ctx, input }) => {
      await reorderItemTypes(input.codes);
      logger.info("Item types reordered", { user: ctx.user, count: input.codes.length });
    }),
};
