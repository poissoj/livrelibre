import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";

import { db } from "@livrelibre/server/db/database";
import {
  addPurchase,
  getCustomer,
  getSelectedCustomer,
  resetCustomer,
  searchCustomers,
  setCustomer,
  setSelectedCustomer,
} from "@livrelibre/server/server/customers";
import { purchases, selectedCustomer } from "@livrelibre/shared/schema";

import { seedCustomer, seedUser, truncateAll } from "./helpers";

describe("searchCustomers", () => {
  beforeEach(truncateAll);

  it("matches customers by partial name", async () => {
    await seedCustomer({ fullname: "Jean Dupont", nmFullname: "jean dupont" });
    await seedCustomer({
      fullname: "Marie Martin",
      nmFullname: "marie martin",
    });

    const result = await searchCustomers("dup");
    expect(result).toHaveLength(1);
    expect(result[0].fullname).toBe("Jean Dupont");
  });

  it("returns an empty list for a search shorter than 2 characters", async () => {
    await seedCustomer();
    expect(await searchCustomers("d")).toEqual([]);
  });
});

describe("setCustomer", () => {
  beforeEach(truncateAll);

  it("updates an existing customer", async () => {
    const customer = await seedCustomer();
    const res = await setCustomer(
      {
        fullname: "Nouveau Nom",
        nmFullname: "nouveau nom",
        contact: "",
        phone: null,
        email: null,
        comment: "",
      },
      customer.id,
    );
    expect(res.type).toBe("success");

    const updated = await getCustomer(customer.id);
    expect(updated?.fullname).toBe("Nouveau Nom");
  });
});

describe("selected customer", () => {
  beforeEach(truncateAll);

  it("setSelectedCustomer and getSelectedCustomer round-trip", async () => {
    const user = await seedUser();
    const customer = await seedCustomer();

    await setSelectedCustomer({
      asideCart: false,
      userId: user.id,
      customerId: customer.id,
    });

    const selected = await getSelectedCustomer(user.id, false);
    expect(selected?.customerId).toBe(customer.id);
  });

  it("setSelectedCustomer upserts on userId", async () => {
    const user = await seedUser();
    const first = await seedCustomer();
    const second = await seedCustomer();

    await setSelectedCustomer({
      asideCart: false,
      userId: user.id,
      customerId: first.id,
    });
    await setSelectedCustomer({
      asideCart: false,
      userId: user.id,
      customerId: second.id,
    });

    const selected = await getSelectedCustomer(user.id, false);
    expect(selected?.customerId).toBe(second.id);

    const rows = await db
      .select()
      .from(selectedCustomer)
      .where(eq(selectedCustomer.userId, user.id));
    expect(rows).toHaveLength(1);
  });
});

describe("resetCustomer", () => {
  beforeEach(truncateAll);

  it("removes all purchases for a customer", async () => {
    const customer = await seedCustomer();
    await addPurchase(customer.id, 10);
    await addPurchase(customer.id, 5);

    await resetCustomer(customer.id);

    const remaining = await db.select().from(purchases);
    expect(remaining).toHaveLength(0);
  });
});
