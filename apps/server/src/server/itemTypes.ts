import { ERROR_CODES } from "@livrelibre/shared/errors";
import { BOOK_ITEM_TYPE } from "@livrelibre/shared/item";
import { asideCart, cart, itemTypes, items, sales } from "@livrelibre/shared/schema";
import { db, type Transaction } from "@server/db/database";
import { TRPCError } from "@trpc/server";
import { asc, count, eq, max, ne } from "drizzle-orm";

export type ItemTypeInput = {
  code: string;
  label: string;
  position?: number | undefined;
  active?: boolean | undefined;
  isDefault?: boolean | undefined;
};

export type ItemTypeUpdate = {
  label?: string | undefined;
  position?: number | undefined;
  active?: boolean | undefined;
  isDefault?: boolean | undefined;
};

const itemTypeNotFound = () =>
  new TRPCError({ code: "NOT_FOUND", message: ERROR_CODES.ITEM_TYPE_NOT_FOUND });

const clearOtherDefaults = async (tx: Transaction, code: string): Promise<void> => {
  await tx.update(itemTypes).set({ isDefault: false }).where(ne(itemTypes.code, code));
};

const nextPosition = async (): Promise<number> => {
  const rows = await db.select({ max: max(itemTypes.position) }).from(itemTypes);
  return (rows[0].max ?? 0) + 1;
};

export const getItemTypes = async () =>
  await db.select().from(itemTypes).orderBy(asc(itemTypes.position), asc(itemTypes.label));

export const getActiveItemTypes = async () =>
  await db
    .select()
    .from(itemTypes)
    .where(eq(itemTypes.active, true))
    .orderBy(asc(itemTypes.position), asc(itemTypes.label));

/**
 * Applique l'ordre fourni : `position = index` pour chaque code (0…n-1).
 * Normalise au passage les positions dupliquées ou trouées.
 */
export const reorderItemTypes = async (codes: string[]): Promise<void> => {
  await db.transaction(async (tx) => {
    for (const [index, code] of codes.entries()) {
      await tx.update(itemTypes).set({ position: index }).where(eq(itemTypes.code, code));
    }
  });
};

/** Code du type par défaut (drapeau `isDefault`, sinon premier type actif). */
export const getDefaultItemTypeCode = async (): Promise<string | null> => {
  const flagged = await db
    .select({ code: itemTypes.code })
    .from(itemTypes)
    .where(eq(itemTypes.isDefault, true))
    .limit(1);
  if (flagged.length > 0) return flagged[0].code;
  const fallback = await db
    .select({ code: itemTypes.code })
    .from(itemTypes)
    .where(eq(itemTypes.active, true))
    .orderBy(asc(itemTypes.position))
    .limit(1);
  return fallback.length > 0 ? fallback[0].code : null;
};

/** Type utilisé pour l'import : `book`, sinon le type par défaut. */
export const getBookItemTypeCode = async (): Promise<string | null> => {
  if (await itemTypeExists(BOOK_ITEM_TYPE)) {
    return BOOK_ITEM_TYPE;
  }
  return await getDefaultItemTypeCode();
};

export const itemTypeExists = async (code: string): Promise<boolean> => {
  const rows = await db
    .select({ code: itemTypes.code })
    .from(itemTypes)
    .where(eq(itemTypes.code, code))
    .limit(1);
  return rows.length > 0;
};

export const createItemType = async (input: ItemTypeInput): Promise<void> => {
  const existing = await db
    .select({ code: itemTypes.code })
    .from(itemTypes)
    .where(eq(itemTypes.code, input.code))
    .limit(1);
  if (existing.length > 0) {
    throw new TRPCError({ code: "CONFLICT", message: ERROR_CODES.ITEM_TYPE_ALREADY_EXISTS });
  }
  const empty = await db.select({ count: count() }).from(itemTypes);
  const position = input.position ?? (await nextPosition());
  const active = input.active ?? true;
  if (input.isDefault === true && !active) {
    throw new TRPCError({ code: "BAD_REQUEST", message: ERROR_CODES.ITEM_TYPE_INACTIVE_DEFAULT });
  }
  const isDefault = (input.isDefault ?? (empty[0].count === 0 && active)) && active;
  await db.transaction(async (tx) => {
    if (isDefault) {
      await clearOtherDefaults(tx, input.code);
    }
    await tx.insert(itemTypes).values({
      code: input.code,
      label: input.label,
      position,
      active,
      isDefault,
    });
  });
};

export const updateItemType = async (code: string, input: ItemTypeUpdate) => {
  const rows = await db.select().from(itemTypes).where(eq(itemTypes.code, code)).limit(1);
  if (rows.length === 0) {
    throw itemTypeNotFound();
  }
  const current = rows[0];
  const active = input.active ?? current.active;
  if (input.isDefault === true && !active) {
    throw new TRPCError({ code: "BAD_REQUEST", message: ERROR_CODES.ITEM_TYPE_INACTIVE_DEFAULT });
  }
  const isDefault = (input.isDefault ?? current.isDefault) && active;
  await db.transaction(async (tx) => {
    if (isDefault) {
      await clearOtherDefaults(tx, code);
    }
    await tx
      .update(itemTypes)
      .set({
        label: input.label ?? current.label,
        position: input.position ?? current.position,
        active,
        isDefault,
      })
      .where(eq(itemTypes.code, code));
  });
};

const isReferenced = async (code: string): Promise<boolean> => {
  const checks = await Promise.all([
    db.select({ count: count() }).from(items).where(eq(items.type, code)),
    db.select({ count: count() }).from(cart).where(eq(cart.type, code)),
    db.select({ count: count() }).from(asideCart).where(eq(asideCart.type, code)),
    db.select({ count: count() }).from(sales).where(eq(sales.itemType, code)),
  ]);
  return checks.some((rows) => rows[0].count > 0);
};

export const deleteItemType = async (code: string): Promise<void> => {
  const rows = await db.select().from(itemTypes).where(eq(itemTypes.code, code)).limit(1);
  if (rows.length === 0) {
    throw itemTypeNotFound();
  }
  const current = rows[0];
  if (await isReferenced(code)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: ERROR_CODES.ITEM_TYPE_IN_USE });
  }
  await db.transaction(async (tx) => {
    await tx.delete(itemTypes).where(eq(itemTypes.code, code));
    if (current.isDefault) {
      const fallback = await tx
        .select({ code: itemTypes.code })
        .from(itemTypes)
        .where(eq(itemTypes.active, true))
        .orderBy(asc(itemTypes.position))
        .limit(1);
      if (fallback.length > 0) {
        await tx
          .update(itemTypes)
          .set({ isDefault: true })
          .where(eq(itemTypes.code, fallback[0].code));
      }
    }
  });
};
