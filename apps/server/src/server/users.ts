import { ERROR_CODES } from "@livrelibre/shared/errors";
import { asideCart, cart, selectedCustomer, users } from "@livrelibre/shared/schema";
import { db } from "@server/db/database";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";
import { and, count, eq, ne } from "drizzle-orm";

const BCRYPT_ROUNDS = 12;

export type Role = "admin" | "cashier";

export type ManagedUser = {
  id: number;
  name: string;
  role: Role;
};

const userNotFound = () =>
  new TRPCError({ code: "NOT_FOUND", message: ERROR_CODES.USER_NOT_FOUND });

const getUserById = async (id: number) =>
  await db.query.users.findFirst({ where: eq(users.id, id) });

const countAdmins = async (): Promise<number> => {
  const [row] = await db.select({ count: count() }).from(users).where(eq(users.role, "admin"));
  return row.count;
};

const assertNameAvailable = async (name: string, excludeId?: number): Promise<void> => {
  const existing = await db.query.users.findFirst({
    where:
      excludeId == null ? eq(users.name, name) : and(eq(users.name, name), ne(users.id, excludeId)),
  });
  if (existing) {
    throw new TRPCError({ code: "CONFLICT", message: ERROR_CODES.USER_ALREADY_EXISTS });
  }
};

export const changePassword = async (
  userId: number,
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  const dbUser = await getUserById(userId);
  if (!dbUser) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const passwordMatches = await bcrypt.compare(currentPassword, dbUser.hash);
  if (!passwordMatches) {
    throw new TRPCError({ code: "BAD_REQUEST", message: ERROR_CODES.INVALID_PASSWORD });
  }
  const hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await db.update(users).set({ hash }).where(eq(users.id, userId));
};

export const getUsers = async (): Promise<ManagedUser[]> =>
  await db
    .select({ id: users.id, name: users.name, role: users.role })
    .from(users)
    .orderBy(users.name);

export const createUser = async (name: string, password: string, role: Role): Promise<void> => {
  await assertNameAvailable(name);
  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  await db.insert(users).values({ name, hash, role });
};

export const updateUser = async (id: number, name: string, role: Role): Promise<void> => {
  const dbUser = await getUserById(id);
  if (!dbUser) {
    throw userNotFound();
  }
  await assertNameAvailable(name, id);
  if (dbUser.role === "admin" && role !== "admin" && (await countAdmins()) <= 1) {
    throw new TRPCError({ code: "BAD_REQUEST", message: ERROR_CODES.LAST_ADMIN });
  }
  await db.update(users).set({ name, role }).where(eq(users.id, id));
};

export const resetUserPassword = async (id: number, password: string): Promise<void> => {
  const dbUser = await getUserById(id);
  if (!dbUser) {
    throw userNotFound();
  }
  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  await db.update(users).set({ hash }).where(eq(users.id, id));
};

export const deleteUser = async (id: number, currentUserId: number): Promise<void> => {
  if (id === currentUserId) {
    throw new TRPCError({ code: "BAD_REQUEST", message: ERROR_CODES.CANNOT_DELETE_SELF });
  }
  const dbUser = await getUserById(id);
  if (!dbUser) {
    throw userNotFound();
  }
  if (dbUser.role === "admin" && (await countAdmins()) <= 1) {
    throw new TRPCError({ code: "BAD_REQUEST", message: ERROR_CODES.LAST_ADMIN });
  }
  await db.transaction(async (tx) => {
    await tx.delete(cart).where(eq(cart.userId, id));
    await tx.delete(asideCart).where(eq(asideCart.userId, id));
    await tx.delete(selectedCustomer).where(eq(selectedCustomer.userId, id));
    await tx.delete(users).where(eq(users.id, id));
  });
};
