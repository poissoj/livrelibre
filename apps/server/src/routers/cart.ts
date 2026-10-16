import { ERROR_CODES } from "@livrelibre/shared/errors";
import { TVAValues, zItemType } from "@livrelibre/shared/item";
import { CART_ITEM_KINDS } from "@livrelibre/shared/sale";
import { zDateISO, zId, zPrice, zQuantity } from "@livrelibre/shared/validation";
import {
  addISBNToCart,
  addNewItemToCart,
  addToCart,
  getAsideCart,
  getCart,
  payCart,
  putCartAside,
  reactivateCart,
  removeFromCart,
} from "@server/server/cart";
import { itemTypeExists } from "@server/server/itemTypes";
import { logger } from "@server/utils/logger";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { authProcedure } from "../procedures";

const payCartSchema = z.object({
  paymentDate: zDateISO,
  paymentType: z.enum(["cash", "card", "check", "check-lire", "transfer"]),
});

export const cartRoutes = {
  asideCart: authProcedure.query(async ({ ctx }) => await getAsideCart(ctx.user.id)),
  cart: authProcedure.query(async ({ ctx }) => await getCart(ctx.user.id)),
  addISBNToCart: authProcedure
    .input(z.string().regex(/^\d{10,13}$/))
    .mutation(async ({ input, ctx }) => {
      logger.info("Quick add to cart", { user: ctx.user, isbn: input });
      return await addISBNToCart(ctx.user.id, input);
    }),
  addNewItemToCart: authProcedure
    .input(
      z.object({
        price: zPrice,
        title: z.string(),
        tva: z.enum(TVAValues),
        type: zItemType,
        kind: z.enum(CART_ITEM_KINDS).default("standalone"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!(await itemTypeExists(input.type))) {
        throw new TRPCError({ code: "BAD_REQUEST", message: ERROR_CODES.INVALID_ITEM_TYPE });
      }
      await addNewItemToCart(ctx.user.id, input);
    }),
  addToCart: authProcedure
    .input(z.object({ id: zId, quantity: zQuantity.optional() }))
    .mutation(async ({ input, ctx }) => {
      logger.info("Add to cart", {
        user: ctx.user,
        itemId: input.id,
        quantity: input.quantity,
      });
      await addToCart(ctx.user.id, input.id, input.quantity);
    }),
  payCart: authProcedure.input(payCartSchema).mutation(async ({ input, ctx }) => {
    logger.info("Pay cart", { user: ctx.user, paymentType: input.paymentType });
    return await payCart(ctx.user.id, input);
  }),
  putCartAside: authProcedure.mutation(async ({ ctx }) => {
    await putCartAside(ctx.user.id);
  }),
  reactivateCart: authProcedure.mutation(async ({ ctx }) => {
    await reactivateCart(ctx.user.id);
  }),
  removeFromCart: authProcedure.input(zId).mutation(async ({ ctx, input }) => {
    logger.info("Remove from cart", { user: ctx.user, cartItemId: input });
    await removeFromCart(ctx.user.id, input);
  }),
};
