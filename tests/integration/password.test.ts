import { db } from "@livrelibre/server/db/database";
import { appRouter } from "@livrelibre/server/router";
import { users } from "@livrelibre/shared/schema";
import type { User } from "@server/auth";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";

import { truncateAll } from "./helpers";

const BCRYPT_ROUNDS = 4;

const seedUserWithPassword = async (
  name: string,
  password: string,
  role: "admin" | "cashier" = "admin",
) => {
  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const rows = await db.insert(users).values({ name, hash, role }).returning();
  return rows[0];
};

const callerFor = (user: User) => appRouter.createCaller({ user });

const anonymous: User = { id: 0, name: "", role: "anonymous" };

describe("changePassword", () => {
  beforeEach(truncateAll);

  it("updates the password when the current one matches", async () => {
    const user = await seedUserWithPassword("admin", "oldpassword");
    const caller = callerFor({ id: user.id, name: user.name, role: user.role });

    await caller.changePassword({ currentPassword: "oldpassword", newPassword: "newpassword" });

    const updated = await db.query.users.findFirst({ where: eq(users.id, user.id) });
    await expect(bcrypt.compare("newpassword", updated?.hash ?? "")).resolves.toBe(true);
    await expect(bcrypt.compare("oldpassword", updated?.hash ?? "")).resolves.toBe(false);
  });

  it("rejects a wrong current password without changing the hash", async () => {
    const user = await seedUserWithPassword("admin", "oldpassword");
    const caller = callerFor({ id: user.id, name: user.name, role: user.role });

    await expect(
      caller.changePassword({ currentPassword: "wrongpassword", newPassword: "newpassword" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });

    const unchanged = await db.query.users.findFirst({ where: eq(users.id, user.id) });
    await expect(bcrypt.compare("oldpassword", unchanged?.hash ?? "")).resolves.toBe(true);
  });

  it("rejects an unauthenticated caller", async () => {
    await expect(
      callerFor(anonymous).changePassword({
        currentPassword: "oldpassword",
        newPassword: "newpassword",
      }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects a new password shorter than 8 characters", async () => {
    const user = await seedUserWithPassword("admin", "oldpassword");
    const caller = callerFor({ id: user.id, name: user.name, role: user.role });

    await expect(
      caller.changePassword({ currentPassword: "oldpassword", newPassword: "short" }),
    ).rejects.toThrow();
  });
});
