import { appRouter } from "@livrelibre/server/router";
import { getDefaultPaymentMethod } from "@server/server/paymentMethods";
import { beforeEach, describe, expect, it } from "vitest";

import { seedSale, truncateAll } from "./helpers";

const admin = appRouter.createCaller({ user: { id: 1, name: "admin", role: "admin" } });
const cashier = appRouter.createCaller({ user: { id: 2, name: "cashier", role: "cashier" } });

describe("paymentMethods", () => {
  beforeEach(truncateAll);

  it("lists the seeded methods in position order", async () => {
    const methods = await admin.paymentMethods();
    expect(methods.map((method) => method.code)).toEqual([
      "cash",
      "card",
      "check",
      "check-lire",
      "transfer",
    ]);
    expect(methods.find((method) => method.isDefault)?.code).toBe("cash");
    expect((await getDefaultPaymentMethod())?.code).toBe("cash");
  });

  it("allows admins to create and rename a method", async () => {
    await admin.createPaymentMethod({ code: "gift", label: "Carte cadeau" });
    let methods = await admin.paymentMethods();
    expect(methods.find((method) => method.code === "gift")?.label).toBe("Carte cadeau");

    await admin.updatePaymentMethod({ code: "gift", label: "Bon cadeau" });
    methods = await admin.paymentMethods();
    expect(methods.find((method) => method.code === "gift")?.label).toBe("Bon cadeau");
  });

  it("rejects a duplicate code", async () => {
    await expect(
      admin.createPaymentMethod({ code: "cash", label: "Espèces" }),
    ).rejects.toMatchObject({
      code: "CONFLICT",
    });
  });

  it("keeps a single active default", async () => {
    await admin.createPaymentMethod({ code: "gift", label: "Carte cadeau", isDefault: true });
    const methods = await admin.paymentMethods();
    expect(methods.filter((method) => method.isDefault).map((method) => method.code)).toEqual([
      "gift",
    ]);
    expect((await getDefaultPaymentMethod())?.code).toBe("gift");
  });

  it("rejects an inactive default", async () => {
    await expect(
      admin.createPaymentMethod({
        code: "gift",
        label: "Carte cadeau",
        active: false,
        isDefault: true,
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });

    await expect(
      admin.updatePaymentMethod({ code: "cash", active: false, isDefault: true }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("deletes an unused method", async () => {
    await admin.createPaymentMethod({ code: "gift", label: "Carte cadeau" });
    await admin.deletePaymentMethod("gift");
    const methods = await admin.paymentMethods();
    expect(methods.some((method) => method.code === "gift")).toBe(false);
  });

  it("refuses to delete a method used by a sale", async () => {
    await seedSale({ paymentType: "cash" });
    await expect(admin.deletePaymentMethod("cash")).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
    const methods = await admin.paymentMethods();
    expect(methods.some((method) => method.code === "cash")).toBe(true);
  });

  it("keeps at least one active method", async () => {
    for (const code of ["card", "check", "check-lire", "transfer"]) {
      await admin.updatePaymentMethod({ code, active: false });
    }
    await expect(admin.updatePaymentMethod({ code: "cash", active: false })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
    await expect(admin.deletePaymentMethod("cash")).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("reorders methods and normalizes positions", async () => {
    const before = (await admin.paymentMethods()).map((method) => method.code);
    const [first, second] = before;
    await admin.reorderPaymentMethods({ codes: [second, first, ...before.slice(2)] });

    const after = await admin.paymentMethods();
    expect(after.map((method) => method.code)).toEqual([second, first, ...before.slice(2)]);
    expect(after.map((method) => method.position)).toEqual(after.map((_, index) => index));
  });

  it("rejects an unknown or inactive method at payment time", async () => {
    await expect(
      admin.payCart({ paymentDate: "2024-01-01", paymentType: "nope" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });

    await admin.updatePaymentMethod({ code: "cash", active: false });
    await expect(
      admin.payCart({ paymentDate: "2024-01-01", paymentType: "cash" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("restricts method management to admins", async () => {
    await expect(
      cashier.createPaymentMethod({ code: "gift", label: "Carte cadeau" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(cashier.deletePaymentMethod("cash")).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
