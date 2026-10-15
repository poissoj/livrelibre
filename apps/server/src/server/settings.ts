import { settings } from "@livrelibre/shared/schema";
import { DEFAULT_SETTINGS, type Settings } from "@livrelibre/shared/settings";
import { db } from "@server/db/database";
import { eq } from "drizzle-orm";

const SETTINGS_ID = 1;

const toSettings = (row: typeof settings.$inferSelect | undefined): Settings => {
  if (!row) return DEFAULT_SETTINGS;
  return { loyaltyDiscountPercent: Number(row.loyaltyDiscountPercent) };
};

/** Réglages de l'application (ligne singleton, créée avec les valeurs par défaut si absente). */
export const getSettings = async (): Promise<Settings> => {
  const rows = await db.select().from(settings).where(eq(settings.id, SETTINGS_ID)).limit(1);
  if (rows.length > 0) return toSettings(rows[0]);

  const inserted = await db
    .insert(settings)
    .values({
      id: SETTINGS_ID,
      loyaltyDiscountPercent: String(DEFAULT_SETTINGS.loyaltyDiscountPercent),
    })
    .onConflictDoNothing()
    .returning();
  return toSettings(inserted[0]);
};

export const updateSettings = async (input: Settings): Promise<Settings> => {
  const rows = await db
    .insert(settings)
    .values({
      id: SETTINGS_ID,
      loyaltyDiscountPercent: String(input.loyaltyDiscountPercent),
    })
    .onConflictDoUpdate({
      target: settings.id,
      set: { loyaltyDiscountPercent: String(input.loyaltyDiscountPercent) },
    })
    .returning();
  return toSettings(rows[0]);
};
