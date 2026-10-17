import { zCustomer } from "@livrelibre/shared/customer";
import { ERROR_CODES } from "@livrelibre/shared/errors";
import { norm } from "@livrelibre/shared/utils";
import { zId, zPage } from "@livrelibre/shared/validation";
import {
  customerExistsByNmFullname,
  deleteCustomer,
  getCustomer,
  getCustomers,
  getSelectedCustomer,
  newCustomer,
  searchCustomers,
  setCustomer,
  setSelectedCustomer,
} from "@server/server/customers";
import { logger } from "@server/utils/logger";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { authProcedure } from "../procedures";

export const customerRoutes = {
  customer: authProcedure.input(zId).query(async ({ input }) => await getCustomer(input)),
  customers: authProcedure
    .input(
      z.object({
        pageNumber: zPage,
        fullname: z.string().optional(),
        withPurchases: z.boolean().default(false),
      }),
    )
    .query(async ({ input }) => await getCustomers(input)),
  searchCustomer: authProcedure
    .input(z.string())
    .query(async ({ input }) => await searchCustomers(input)),
  selectedCustomer: authProcedure.query(async ({ ctx }) => {
    const customer = await getSelectedCustomer(ctx.user.id, false);
    return customer?.customerId ? await getCustomer(customer.customerId) : null;
  }),
  updateCustomer: authProcedure
    .input(
      z.object({
        customerId: zId.optional(),
        customer: zCustomer,
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const nmFullname = norm(input.customer.fullname);
      const duplicate = await customerExistsByNmFullname(nmFullname, input.customerId);
      if (duplicate) {
        throw new TRPCError({
          code: "CONFLICT",
          message: ERROR_CODES.CUSTOMER_ALREADY_EXISTS,
        });
      }
      const customer = {
        ...input.customer,
        phone: input.customer.phone ?? null,
        email: input.customer.email ?? null,
        nmFullname,
      };
      if (input.customerId) {
        logger.info("Update customer", {
          user: ctx.user,
          customerId: input.customerId,
        });
        return await setCustomer(customer, input.customerId);
      } else {
        logger.info("New customer", { user: ctx.user });
        return await newCustomer(customer);
      }
    }),
  deleteCustomer: authProcedure.input(z.object({ id: zId })).mutation(async ({ ctx, input }) => {
    logger.info("Delete customer", { user: ctx.user, customerId: input.id });
    return await deleteCustomer(input.id);
  }),
  selectCustomer: authProcedure
    .input(
      z.object({
        customerId: zId.nullable(),
        asideCart: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      logger.info("Select customer", {
        user: ctx.user,
        customerId: input.customerId,
      });
      return await setSelectedCustomer({ ...input, userId: ctx.user.id });
    }),
};
