import { zOrder, zOrderSort, zOrderStatusArray } from "@livrelibre/shared/order";
import { zId, zPage } from "@livrelibre/shared/validation";
import {
  deleteOrder,
  getCustomerActiveOrders,
  getItemOrders,
  getOrder,
  getOrders,
  newOrder,
  setCustomerNotified,
  setOrder,
} from "@server/server/orders";
import { logger } from "@server/utils/logger";
import { z } from "zod";

import { authProcedure } from "../procedures";

export const orderRoutes = {
  order: authProcedure.input(zId).query(async ({ input }) => await getOrder(input)),
  itemOrders: authProcedure.input(zId).query(async ({ input }) => await getItemOrders(input)),
  orders: authProcedure
    .input(
      z.object({
        statuses: zOrderStatusArray,
        page: zPage.default(1),
        grouped: z.boolean().default(true),
        search: z.string().default(""),
        sortBy: zOrderSort.default("dateDesc"),
      }),
    )
    .query(
      async ({ input }) =>
        await getOrders({
          statuses: input.statuses,
          pageNumber: input.page,
          grouped: input.grouped,
          search: input.search,
          sortBy: input.sortBy,
        }),
    ),
  customerOrders: authProcedure
    .input(zId)
    .query(async ({ input }) => await getCustomerActiveOrders(input)),
  newOrder: authProcedure.input(zOrder).mutation(async ({ ctx, input }) => {
    logger.info("New order", {
      user: ctx.user,
      customerId: input.customerId,
      itemId: input.itemId,
    });
    return await newOrder(input, ctx.user);
  }),
  updateOrder: authProcedure
    .input(
      z.object({
        order: zOrder,
        id: zId,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      logger.info("Update order", { user: ctx.user, orderId: input.id });
      return await setOrder(input.order, input.id, ctx.user);
    }),
  setCustomerNotified: authProcedure
    .input(
      z.object({
        orderId: zId,
        customerNotified: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      logger.info("Set customer notified", { user: ctx.user, ...input });
      return await setCustomerNotified(input.orderId, input.customerNotified);
    }),
  deleteOrder: authProcedure.input(z.object({ id: zId })).mutation(async ({ ctx, input }) => {
    logger.info("Delete order", { user: ctx.user, orderId: input.id });
    return await deleteOrder(input.id, ctx.user);
  }),
};
