import { TRPCError } from "@trpc/server";
import {
  and,
  countDistinct,
  eq,
  getTableColumns,
  isNotNull,
  sql,
  sum,
} from "drizzle-orm";

import type { CustomerWithPurchase } from "@livrelibre/shared/customer";
import { formatDate } from "@livrelibre/shared/date";
import { ITEMS_PER_PAGE } from "@livrelibre/shared/pagination";
import {
  customers,
  purchases,
  selectedCustomer,
} from "@livrelibre/shared/schema";
import { norm, sanitize } from "@livrelibre/shared/utils";

import { type Transaction, db } from "@server/db/database";
import { logger } from "@server/utils/logger";

export const getCustomers = async ({
  pageNumber = 1,
  fullname,
  withPurchases = false,
}: {
  pageNumber?: number;
  fullname?: string | undefined;
  withPurchases?: boolean;
}) => {
  let clause = fullname
    ? sql`${customers.nmFullname} ~* ${sanitize(norm(fullname))}`
    : undefined;
  if (withPurchases) {
    clause = and(clause, isNotNull(purchases.amount));
  }
  const countPromise = db
    .select({ count: countDistinct(customers.id) })
    .from(customers)
    .leftJoin(purchases, eq(customers.id, purchases.customerId))
    .where(clause);
  const itemsPromise = db
    .select({
      ...getTableColumns(customers),
      total: sum(purchases.amount),
    })
    .from(customers)
    .leftJoin(purchases, eq(customers.id, purchases.customerId))
    .where(clause)
    .groupBy(customers.id)
    .orderBy(customers.fullname)
    .limit(ITEMS_PER_PAGE)
    .offset((pageNumber - 1) * ITEMS_PER_PAGE);
  const [countResult, items] = await Promise.all([countPromise, itemsPromise]);
  const count = countResult[0].count;
  const pageCount = Math.ceil(count / ITEMS_PER_PAGE);
  return { count, pageCount, items };
};

const MAX_CUSTOMERS_TO_DISPLAY = 10;
export const searchCustomers = async (search: string) => {
  if (search.length < 2) {
    return [];
  }
  const searchValue = sanitize(norm(search));
  return await db
    .select()
    .from(customers)
    .where(sql`${customers.nmFullname} ~* ${searchValue}`)
    .orderBy(customers.fullname)
    .limit(MAX_CUSTOMERS_TO_DISPLAY);
};

export const resetCustomer = async (id: number, tx?: Transaction) => {
  return await (tx ?? db).delete(purchases).where(eq(purchases.customerId, id));
};

export const addPurchase = async (
  customerId: number,
  amount: number,
  tx?: Transaction,
) => {
  const date = formatDate(new Date()).split("-").reverse().join("/");
  return await (tx ?? db)
    .insert(purchases)
    .values({ amount: String(amount), date, customerId });
};

export const getSelectedCustomer = async (
  userId: number,
  asideCart: boolean,
  tx?: Transaction,
) => {
  const rows = await (tx ?? db)
    .select()
    .from(selectedCustomer)
    .where(
      and(
        eq(selectedCustomer.userId, userId),
        eq(selectedCustomer.asideCart, asideCart),
      ),
    );
  return rows.length > 0 ? rows[0] : null;
};

export const setSelectedCustomer = async (
  customer: typeof selectedCustomer.$inferInsert,
  tx?: Transaction,
) => {
  const conn = tx ?? db;
  if (customer.customerId != null) {
    const found = await conn
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.id, customer.customerId));
    if (found.length === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Client inconnu",
      });
    }
  }
  return await conn
    .insert(selectedCustomer)
    .values(customer)
    .onConflictDoUpdate({ target: selectedCustomer.userId, set: customer });
};

export const getCustomer = async (
  id: number,
): Promise<CustomerWithPurchase | null> => {
  const rows = await db.select().from(customers).where(eq(customers.id, id));
  if (rows.length === 0) {
    return null;
  }
  const purchaseList = await db
    .select()
    .from(purchases)
    .where(eq(purchases.customerId, id));
  return {
    ...rows[0],
    purchases: purchaseList.map((p) => ({ ...p, amount: Number(p.amount) })),
  };
};

export const deleteCustomer = async (customerId: number) => {
  try {
    await db.transaction(async (tx) => {
      await tx.delete(purchases).where(eq(purchases.customerId, customerId));
      await tx.delete(customers).where(eq(customers.id, customerId));
    });
    return { type: "success" as const, msg: "Le client a été supprimé" };
  } catch (error) {
    logger.error(error);
    return { type: "error" as const, msg: "Impossible de supprimer le client" };
  }
};

export const setCustomer = async (
  customer: typeof customers.$inferInsert,
  id: number,
) => {
  try {
    await db.update(customers).set(customer).where(eq(customers.id, id));
    return { type: "success" as const, msg: "Le client a été modifié", id };
  } catch (error) {
    logger.error(error);
    return { type: "error" as const, msg: "Impossible de modifier le client" };
  }
};

export const newCustomer = async (customer: typeof customers.$inferInsert) => {
  try {
    const rows = await db
      .insert(customers)
      .values(customer)
      .returning({ id: customers.id });
    return {
      type: "success" as const,
      msg: "Le client a été ajouté",
      id: rows[0].id,
    };
  } catch (error) {
    logger.error(error);
    return { type: "error" as const, msg: "Impossible d'ajouter le client" };
  }
};
