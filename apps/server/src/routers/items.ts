import { ERROR_CODES } from "@livrelibre/shared/errors";
import { TVAValues, zItem } from "@livrelibre/shared/item";
import { zDateISO, zId, zIsbn, zPage } from "@livrelibre/shared/validation";
import { addItem } from "@server/server/addItem";
import { getBookmarks, starItem } from "@server/server/bookmarks";
import { itemTypeExists } from "@server/server/itemTypes";
import {
  type AdvancedSearchField,
  advancedSearch,
  getItem,
  getItems,
  isAdvancedSearchField,
  searchItems,
} from "@server/server/searchItem";
import { updateItem } from "@server/server/updateItem";
import { logger } from "@server/utils/logger";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { authProcedure } from "../procedures";

type AdvancedSearchValueRule = { isValid: (value: string) => boolean; message: string };

const ADVANCED_SEARCH_VALUE_RULES: Partial<Record<AdvancedSearchField, AdvancedSearchValueRule>> = {
  tva: {
    isValid: (value) => z.enum(TVAValues).safeParse(value).success,
    message: ERROR_CODES.INVALID_TVA,
  },
  datebought: {
    isValid: (value) => zDateISO.safeParse(value).success,
    message: ERROR_CODES.INVALID_DATE,
  },
  isbn: {
    isValid: (value) => zIsbn.safeParse(value).success,
    message: ERROR_CODES.INVALID_ISBN,
  },
  price: {
    isValid: (value) => /^-?\d+([.,]\d+)?$/.test(value),
    message: ERROR_CODES.INVALID_NUMBER,
  },
  amount: {
    isValid: (value) => /^\d+([.,]\d+)?$/.test(value),
    message: ERROR_CODES.INVALID_NUMBER,
  },
};

export const itemRoutes = {
  advancedSearch: authProcedure
    .input(
      z
        .object({ search: z.record(z.string(), z.string()), page: zPage })
        .superRefine(({ search }, ctx) => {
          for (const [key, value] of Object.entries(search)) {
            if (!isAdvancedSearchField(key)) {
              ctx.addIssue({
                code: "custom",
                message: ERROR_CODES.INVALID_SEARCH_FIELD,
                path: ["search", key],
              });
              continue;
            }
            if (value === "") continue;
            const rule = ADVANCED_SEARCH_VALUE_RULES[key];
            if (rule && !rule.isValid(value)) {
              ctx.addIssue({
                code: "custom",
                message: rule.message,
                path: ["search", key],
              });
            }
          }
        }),
    )
    .query(async ({ input }) => {
      const type = input.search.type;
      if (type && !(await itemTypeExists(type))) {
        throw new TRPCError({ code: "BAD_REQUEST", message: ERROR_CODES.INVALID_TYPE });
      }
      return await advancedSearch(input.search, input.page);
    }),
  items: authProcedure
    .input(zPage)
    .query(async ({ input }) => await getItems({ pageNumber: input })),
  searchItem: authProcedure.input(zId).query(async ({ input }) => await getItem(input)),
  quicksearch: authProcedure
    .input(
      z.object({
        search: z.string(),
        page: zPage.default(1),
        inStock: z.boolean().default(false),
      }),
    )
    .query(async ({ input }) => await searchItems(input)),
  isbnSearch: authProcedure
    .input(
      // Barcode scanners sometimes read extra digits; keep the first 13.
      z
        .string()
        .regex(/^\d{10,}$/, ERROR_CODES.INVALID_ISBN)
        .transform((value) => value.slice(0, 13)),
    )
    .query(async ({ input }) => {
      return await searchItems({ search: input });
    }),
  addItem: authProcedure.input(zItem).mutation(async ({ ctx, input }) => {
    if (!(await itemTypeExists(input.type))) {
      throw new TRPCError({ code: "BAD_REQUEST", message: ERROR_CODES.INVALID_ITEM_TYPE });
    }
    logger.info("Add new item", { user: ctx.user, isbn: input.isbn });
    return await addItem(input);
  }),
  updateItem: authProcedure
    .input(z.object({ item: zItem, id: zId }))
    .mutation(async ({ ctx, input }) => {
      if (!(await itemTypeExists(input.item.type))) {
        throw new TRPCError({ code: "BAD_REQUEST", message: ERROR_CODES.INVALID_ITEM_TYPE });
      }
      logger.info("Update item", { user: ctx.user, itemId: input.id });
      return await updateItem(input.item, input.id);
    }),
  bookmarks: authProcedure.query(getBookmarks),
  star: authProcedure
    .input(z.object({ id: zId, starred: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      logger.info("Star item", {
        user: ctx.user,
        itemId: input.id,
        starred: input.starred,
      });
      return await starItem(input.id, input.starred);
    }),
};
