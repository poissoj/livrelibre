import { ERROR_CODES } from "@livrelibre/shared/errors";
import { zPaymentMethodCode } from "@livrelibre/shared/paymentMethod";
import { zDateISO, zId, zPage } from "@livrelibre/shared/validation";
import { getBestSales } from "@server/server/bestSales";
import { lastSales } from "@server/server/lastSales";
import { getSales } from "@server/server/sales";
import { deleteSale, getSalesByDay } from "@server/server/salesByDay";
import { getSalesByMonth } from "@server/server/salesByMonth";
import { searchSales } from "@server/server/searchSale";
import { getStats } from "@server/server/stats";
import { logger } from "@server/utils/logger";
import { z } from "zod";

import { adminProcedure, authProcedure } from "../procedures";

export const saleRoutes = {
  bestsales: authProcedure
    .input(
      z
        .object({
          dateFrom: zDateISO.optional(),
          dateTo: zDateISO.optional(),
        })
        .superRefine(({ dateFrom, dateTo }, ctx) => {
          if (dateFrom && dateTo && dateFrom > dateTo) {
            ctx.addIssue({ code: "custom", message: ERROR_CODES.INVALID_DATE, path: ["dateTo"] });
          }
        })
        .default({}),
    )
    .query(async ({ input }) => getBestSales(input)),
  lastSales: authProcedure.input(zId).query(async ({ input }) => await lastSales(input)),
  sales: adminProcedure.query(getSales),
  salesByDay: authProcedure
    .input(zDateISO)
    .query(async ({ ctx, input }) =>
      getSalesByDay(input, { restrictToToday: ctx.user.role !== "admin" }),
    ),
  salesByMonth: adminProcedure
    .input(
      z.object({
        month: z.string().regex(/^(0[1-9]|1[0-2])$/),
        year: z.string().regex(/^\d{4}$/),
      }),
    )
    .query(async ({ input }) => await getSalesByMonth(input.month, input.year)),
  searchSales: adminProcedure
    .input(
      z
        .object({
          title: z.string().trim().default(""),
          dateFrom: zDateISO.optional(),
          dateTo: zDateISO.optional(),
          paymentType: zPaymentMethodCode.optional(),
          includeDeleted: z.boolean().default(false),
          page: zPage.default(1),
        })
        .superRefine(({ dateFrom, dateTo }, ctx) => {
          if (dateFrom && dateTo && dateFrom > dateTo) {
            ctx.addIssue({ code: "custom", message: ERROR_CODES.INVALID_DATE, path: ["dateTo"] });
          }
        }),
    )
    .query(async ({ input }) =>
      searchSales({
        title: input.title,
        dateFrom: input.dateFrom,
        dateTo: input.dateTo,
        paymentType: input.paymentType,
        includeDeleted: input.includeDeleted,
        pageNumber: input.page,
      }),
    ),
  deleteSale: authProcedure
    .input(
      z.object({
        saleId: zId,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      logger.info("Delete sale", { user: ctx.user, saleId: input.saleId });
      await deleteSale(input.saleId, ctx.user, { restrictToToday: ctx.user.role !== "admin" });
    }),
  stats: authProcedure.query(getStats),
};
