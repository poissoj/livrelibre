import { ERROR_CODES } from "@livrelibre/shared/errors";
import { users } from "@livrelibre/shared/schema";
import { db } from "@server/db/database";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

const BCRYPT_ROUNDS = 12;

export const changePassword = async (
  userId: number,
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  const dbUser = await db.query.users.findFirst({ where: eq(users.id, userId) });
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
