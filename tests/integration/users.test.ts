import { db } from "@livrelibre/server/db/database";
import { appRouter } from "@livrelibre/server/router";
import { asideCart, cart, selectedCustomer, users } from "@livrelibre/shared/schema";
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

const adminCaller = (id = 1, name = "admin") => callerFor({ id, name, role: "admin" });
const cashierCaller = () => callerFor({ id: 2, name: "cashier", role: "cashier" });
const anonymousCaller = () => callerFor({ id: 0, name: "", role: "anonymous" });

describe("user management", () => {
  beforeEach(truncateAll);

  it("lists users with their role", async () => {
    await seedUserWithPassword("admin", "password", "admin");
    await seedUserWithPassword("vendeur", "password", "cashier");

    const result = await adminCaller().users();
    expect(result.map((u) => ({ name: u.name, role: u.role }))).toEqual([
      { name: "admin", role: "admin" },
      { name: "vendeur", role: "cashier" },
    ]);
  });

  it("rejects cashiers and anonymous users", async () => {
    await expect(cashierCaller().users()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      cashierCaller().createUser({ name: "x", password: "password", role: "cashier" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(anonymousCaller().users()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("creates a user with a hashed password", async () => {
    await adminCaller().createUser({ name: "vendeur", password: "motdepasse", role: "cashier" });

    const created = await db.query.users.findFirst({ where: eq(users.name, "vendeur") });
    expect(created?.role).toBe("cashier");
    await expect(bcrypt.compare("motdepasse", created?.hash ?? "")).resolves.toBe(true);
  });

  it("rejects a duplicate name on creation", async () => {
    await seedUserWithPassword("admin", "password");

    await expect(
      adminCaller().createUser({ name: "admin", password: "autremotdepasse", role: "cashier" }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("updates the name and role", async () => {
    const target = await seedUserWithPassword("ancien", "password", "cashier");

    await adminCaller().updateUser({ id: target.id, name: "nouveau", role: "admin" });

    const updated = await db.query.users.findFirst({ where: eq(users.id, target.id) });
    expect(updated?.name).toBe("nouveau");
    expect(updated?.role).toBe("admin");
  });

  it("rejects renaming to an existing name", async () => {
    await seedUserWithPassword("admin", "password");
    const target = await seedUserWithPassword("vendeur", "password", "cashier");

    await expect(
      adminCaller().updateUser({ id: target.id, name: "admin", role: "cashier" }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("refuses to demote the last administrator", async () => {
    const admin = await seedUserWithPassword("admin", "password", "admin");

    await expect(
      adminCaller(admin.id, admin.name).updateUser({
        id: admin.id,
        name: admin.name,
        role: "cashier",
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("refuses to delete one's own account", async () => {
    const admin = await seedUserWithPassword("admin", "password", "admin");

    await expect(adminCaller(admin.id, admin.name).deleteUser(admin.id)).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("deletes a user and their cart data", async () => {
    const admin = await seedUserWithPassword("admin", "password", "admin");
    const target = await seedUserWithPassword("vendeur", "password", "cashier");

    await db.insert(cart).values({
      type: "book",
      title: "T",
      price: "10.00",
      tva: "5.5",
      quantity: 1,
      userId: target.id,
    });
    await db.insert(asideCart).values({
      type: "book",
      title: "T",
      price: "10.00",
      tva: "5.5",
      quantity: 1,
      userId: target.id,
    });
    await db.insert(selectedCustomer).values({ asideCart: false, userId: target.id });

    await adminCaller(admin.id, admin.name).deleteUser(target.id);

    const deleted = await db.query.users.findFirst({ where: eq(users.id, target.id) });
    expect(deleted).toBeUndefined();
    expect(await db.select().from(cart)).toHaveLength(0);
    expect(await db.select().from(asideCart)).toHaveLength(0);
    expect(await db.select().from(selectedCustomer)).toHaveLength(0);
  });

  it("resets a user's password", async () => {
    const admin = await seedUserWithPassword("admin", "password", "admin");
    const target = await seedUserWithPassword("vendeur", "ancien", "cashier");

    await adminCaller(admin.id, admin.name).resetUserPassword({
      id: target.id,
      password: "nouveaupass",
    });

    const updated = await db.query.users.findFirst({ where: eq(users.id, target.id) });
    await expect(bcrypt.compare("nouveaupass", updated?.hash ?? "")).resolves.toBe(true);
    await expect(bcrypt.compare("ancien", updated?.hash ?? "")).resolves.toBe(false);
  });
});
