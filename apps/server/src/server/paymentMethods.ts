import { ERROR_CODES } from "@livrelibre/shared/errors";
import { paymentMethods, type PaymentMethodRow, sales } from "@livrelibre/shared/schema";
import { db, type Transaction } from "@server/db/database";
import { TRPCError } from "@trpc/server";
import { and, asc, count, eq, max, ne } from "drizzle-orm";

export type PaymentMethodInput = {
  code: string;
  label: string;
  position?: number | undefined;
  active?: boolean | undefined;
  isDefault?: boolean | undefined;
};

export type PaymentMethodUpdate = {
  label?: string | undefined;
  position?: number | undefined;
  active?: boolean | undefined;
  isDefault?: boolean | undefined;
};

const paymentMethodNotFound = () =>
  new TRPCError({ code: "NOT_FOUND", message: ERROR_CODES.PAYMENT_METHOD_NOT_FOUND });

const clearOtherDefaults = async (tx: Transaction, code: string): Promise<void> => {
  await tx.update(paymentMethods).set({ isDefault: false }).where(ne(paymentMethods.code, code));
};

const nextPosition = async (): Promise<number> => {
  const rows = await db.select({ max: max(paymentMethods.position) }).from(paymentMethods);
  return (rows[0].max ?? 0) + 1;
};

const activeCount = async (): Promise<number> => {
  const rows = await db
    .select({ count: count() })
    .from(paymentMethods)
    .where(eq(paymentMethods.active, true));
  return rows[0].count;
};

export const getPaymentMethods = async () =>
  await db
    .select()
    .from(paymentMethods)
    .orderBy(asc(paymentMethods.position), asc(paymentMethods.label));

export const getActivePaymentMethods = async () =>
  await db
    .select()
    .from(paymentMethods)
    .where(eq(paymentMethods.active, true))
    .orderBy(asc(paymentMethods.position), asc(paymentMethods.label));

/**
 * Applique l'ordre fourni : `position = index` pour chaque code (0…n-1).
 * Normalise au passage les positions dupliquées ou trouées.
 */
export const reorderPaymentMethods = async (codes: string[]): Promise<void> => {
  await db.transaction(async (tx) => {
    for (const [index, code] of codes.entries()) {
      await tx.update(paymentMethods).set({ position: index }).where(eq(paymentMethods.code, code));
    }
  });
};

/** Moyen de paiement par défaut (drapeau `isDefault`, sinon premier actif). */
export const getDefaultPaymentMethod = async (): Promise<PaymentMethodRow | null> => {
  const flagged = await db
    .select()
    .from(paymentMethods)
    .where(and(eq(paymentMethods.isDefault, true), eq(paymentMethods.active, true)))
    .limit(1);
  if (flagged.length > 0) return flagged[0];
  const fallback = await db
    .select()
    .from(paymentMethods)
    .where(eq(paymentMethods.active, true))
    .orderBy(asc(paymentMethods.position))
    .limit(1);
  return fallback.length > 0 ? fallback[0] : null;
};

export const paymentMethodExists = async (
  code: string,
  options?: { activeOnly?: boolean },
): Promise<boolean> => {
  const conditions = [eq(paymentMethods.code, code)];
  if (options?.activeOnly) {
    conditions.push(eq(paymentMethods.active, true));
  }
  const rows = await db
    .select({ code: paymentMethods.code })
    .from(paymentMethods)
    .where(and(...conditions))
    .limit(1);
  return rows.length > 0;
};

export const createPaymentMethod = async (input: PaymentMethodInput): Promise<void> => {
  const existing = await db
    .select({ code: paymentMethods.code })
    .from(paymentMethods)
    .where(eq(paymentMethods.code, input.code))
    .limit(1);
  if (existing.length > 0) {
    throw new TRPCError({ code: "CONFLICT", message: ERROR_CODES.PAYMENT_METHOD_ALREADY_EXISTS });
  }
  const empty = await db.select({ count: count() }).from(paymentMethods);
  const position = input.position ?? (await nextPosition());
  const active = input.active ?? true;
  if (input.isDefault === true && !active) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: ERROR_CODES.PAYMENT_METHOD_INACTIVE_DEFAULT,
    });
  }
  const isDefault = (input.isDefault ?? (empty[0].count === 0 && active)) && active;
  await db.transaction(async (tx) => {
    if (isDefault) {
      await clearOtherDefaults(tx, input.code);
    }
    await tx.insert(paymentMethods).values({
      code: input.code,
      label: input.label,
      position,
      active,
      isDefault,
    });
  });
};

export const updatePaymentMethod = async (code: string, input: PaymentMethodUpdate) => {
  const rows = await db.select().from(paymentMethods).where(eq(paymentMethods.code, code)).limit(1);
  if (rows.length === 0) {
    throw paymentMethodNotFound();
  }
  const current = rows[0];
  const active = input.active ?? current.active;
  if (!active && current.active && (await activeCount()) <= 1) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: ERROR_CODES.PAYMENT_METHOD_LAST_ACTIVE,
    });
  }
  if (input.isDefault === true && !active) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: ERROR_CODES.PAYMENT_METHOD_INACTIVE_DEFAULT,
    });
  }
  const isDefault = (input.isDefault ?? current.isDefault) && active;
  await db.transaction(async (tx) => {
    if (isDefault) {
      await clearOtherDefaults(tx, code);
    }
    await tx
      .update(paymentMethods)
      .set({
        label: input.label ?? current.label,
        position: input.position ?? current.position,
        active,
        isDefault,
      })
      .where(eq(paymentMethods.code, code));
  });
};

const isReferenced = async (code: string): Promise<boolean> => {
  const rows = await db.select({ count: count() }).from(sales).where(eq(sales.paymentType, code));
  return rows[0].count > 0;
};

export const deletePaymentMethod = async (code: string): Promise<void> => {
  const rows = await db.select().from(paymentMethods).where(eq(paymentMethods.code, code)).limit(1);
  if (rows.length === 0) {
    throw paymentMethodNotFound();
  }
  const current = rows[0];
  if (await isReferenced(code)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: ERROR_CODES.PAYMENT_METHOD_IN_USE });
  }
  if (current.active && (await activeCount()) <= 1) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: ERROR_CODES.PAYMENT_METHOD_LAST_ACTIVE,
    });
  }
  await db.transaction(async (tx) => {
    await tx.delete(paymentMethods).where(eq(paymentMethods.code, code));
    if (current.isDefault) {
      const fallback = await tx
        .select({ code: paymentMethods.code })
        .from(paymentMethods)
        .where(eq(paymentMethods.active, true))
        .orderBy(asc(paymentMethods.position))
        .limit(1);
      if (fallback.length > 0) {
        await tx
          .update(paymentMethods)
          .set({ isDefault: true })
          .where(eq(paymentMethods.code, fallback[0].code));
      }
    }
  });
};
