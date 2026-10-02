/* Usage: pnpm --filter @livrelibre/server exec tsx src/cli/dedupeCustomers.ts [--apply]
 *
 * Détecte les fiches clients en doublon (même nmFullname, insensible à la casse)
 * et les fusionne : les achats, commandes et sélections sont réaffectés vers la
 * fiche conservée, puis les fiches en trop sont supprimées.
 *
 * Par défaut, le script ne fait qu'afficher ce qui serait fait (dry-run).
 * Ajoutez --apply pour appliquer réellement les fusions.
 */
import { inArray, sql } from "drizzle-orm";

import {
  customers,
  orders,
  purchases,
  selectedCustomer,
} from "@livrelibre/shared/schema";

import { db } from "@server/db/database";

type Customer = typeof customers.$inferSelect;

type MergeableField = "phone" | "email" | "contact" | "comment";

const isFilled = (value: string | null | undefined): value is string =>
  value != null && value.trim() !== "";

const countFilledFields = (customer: Customer) =>
  [customer.phone, customer.email, customer.contact, customer.comment].filter(
    isFilled,
  ).length;

// La fiche la plus complète est conservée ; à égalité, la plus ancienne.
const pickKeeper = (group: Customer[]) =>
  [...group].sort((a, b) => {
    const scoreDiff = countFilledFields(b) - countFilledFields(a);
    return scoreDiff !== 0 ? scoreDiff : a.id - b.id;
  })[0];

const firstFilled = (
  group: Customer[],
  field: MergeableField,
): string | null => {
  const found = group.find((customer) => isFilled(customer[field]));
  return found ? found[field] : null;
};

const findDuplicateGroups = async () => {
  const groups = await db
    .select({
      ids: sql<number[]>`array_agg(${customers.id} order by ${customers.id})`,
    })
    .from(customers)
    .groupBy(sql`lower(${customers.nmFullname})`)
    .having(sql`count(*) > 1`);

  const allIds = groups.flatMap((group) => group.ids);
  if (allIds.length === 0) {
    return [];
  }

  const rows = await db
    .select()
    .from(customers)
    .where(inArray(customers.id, allIds));
  const byId = new Map(rows.map((customer) => [customer.id, customer]));

  return groups.map((group) =>
    group.ids.map((id) => byId.get(id)).filter((c): c is Customer => !!c),
  );
};

const mergeGroup = async (keeper: Customer, duplicates: Customer[]) => {
  const duplicateIds = duplicates.map((customer) => customer.id);

  const patch: Partial<typeof customers.$inferInsert> = {};
  if (!isFilled(keeper.phone)) {
    const value = firstFilled(duplicates, "phone");
    if (value) patch.phone = value;
  }
  if (!isFilled(keeper.email)) {
    const value = firstFilled(duplicates, "email");
    if (value) patch.email = value;
  }
  if (!isFilled(keeper.contact)) {
    const value = firstFilled(duplicates, "contact");
    if (value) patch.contact = value;
  }
  if (!isFilled(keeper.comment)) {
    const value = firstFilled(duplicates, "comment");
    if (value) patch.comment = value;
  }

  await db.transaction(async (tx) => {
    await tx
      .update(purchases)
      .set({ customerId: keeper.id })
      .where(inArray(purchases.customerId, duplicateIds));
    await tx
      .update(orders)
      .set({ customerId: keeper.id })
      .where(inArray(orders.customerId, duplicateIds));
    await tx
      .update(selectedCustomer)
      .set({ customerId: keeper.id })
      .where(inArray(selectedCustomer.customerId, duplicateIds));
    if (Object.keys(patch).length > 0) {
      await tx
        .update(customers)
        .set(patch)
        .where(sql`${customers.id} = ${keeper.id}`);
    }
    await tx.delete(customers).where(inArray(customers.id, duplicateIds));
  });
};

const main = async () => {
  try {
    const apply = process.argv.includes("--apply");
    const groups = await findDuplicateGroups();

    if (groups.length === 0) {
      console.log("Aucun doublon trouvé.");
      process.exit(0);
    }

    console.log(`${groups.length} groupe(s) de doublons trouvé(s).`);

    let merged = 0;
    let deleted = 0;
    for (const group of groups) {
      const keeper = pickKeeper(group);
      const duplicates = group.filter((customer) => customer.id !== keeper.id);
      console.log(
        `- "${keeper.fullname}" : conserve #${keeper.id}, supprime ${duplicates
          .map((customer) => `#${customer.id}`)
          .join(", ")}`,
      );

      if (!apply) {
        continue;
      }
      await mergeGroup(keeper, duplicates);
      merged += 1;
      deleted += duplicates.length;
    }

    if (!apply) {
      console.log(
        "\nMode prévisualisation (dry-run). Relancer avec --apply pour appliquer les fusions.",
      );
    } else {
      console.log(
        `\n${merged} groupe(s) fusionné(s), ${deleted} fiche(s) supprimée(s).`,
      );
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

void main();
