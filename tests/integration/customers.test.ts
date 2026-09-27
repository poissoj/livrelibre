import { beforeEach, describe, expect, it } from "vitest";

import { db } from "@livrelibre/server/db/database";
import {
  addPurchase,
  deleteCustomer,
  getCustomer,
  getCustomers,
  getSelectedCustomer,
  newCustomer,
  setSelectedCustomer,
} from "@livrelibre/server/server/customers";
import { purchases } from "@livrelibre/shared/schema";

import { seedCustomer, seedOrder, seedUser, truncateAll } from "./helpers";

describe("customers", () => {
  beforeEach(truncateAll);

  it("creates a customer with newCustomer", async () => {
    const res = await newCustomer({
      fullname: "Jean Dupont",
      nmFullname: "jean dupont",
      contact: "",
      phone: null,
      email: null,
      comment: "",
    });
    expect(res.type).toBe("success");
    const customer = await getCustomer(res.id);
    expect(customer?.fullname).toBe("Jean Dupont");
  });

  it("paginates customers with getCustomers", async () => {
    await seedCustomer({ fullname: "A", nmFullname: "a" });
    await seedCustomer({ fullname: "B", nmFullname: "b" });
    const { count } = await getCustomers({ pageNumber: 1 });
    expect(count).toBe(2);
  });

  it("deleteCustomer removes the customer and their purchases", async () => {
    const customer = await seedCustomer();
    await addPurchase(customer.id, 10);
    await addPurchase(customer.id, 5);

    const res = await deleteCustomer(customer.id);
    expect(res.type).toBe("success");

    expect(await getCustomer(customer.id)).toBeNull();
    const remaining = await db.select().from(purchases);
    expect(remaining).toHaveLength(0);
  });

  it("deleteCustomer refuses to delete a customer with orders", async () => {
    const customer = await seedCustomer();
    await seedOrder({ customerId: customer.id });

    await expect(deleteCustomer(customer.id)).rejects.toThrow(
      "Ce client a des commandes",
    );
    expect(await getCustomer(customer.id)).not.toBeNull();
  });

  it("deleteCustomer detaches the customer from the current selection", async () => {
    const user = await seedUser();
    const customer = await seedCustomer();
    await setSelectedCustomer({
      asideCart: false,
      userId: user.id,
      customerId: customer.id,
    });

    const res = await deleteCustomer(customer.id);
    expect(res.type).toBe("success");
    expect(await getCustomer(customer.id)).toBeNull();
    const selected = await getSelectedCustomer(user.id, false);
    expect(selected?.customerId).toBeNull();
  });

  it("deleteCustomer rejects an unknown customer", async () => {
    await expect(deleteCustomer(999999)).rejects.toThrow("Client inconnu");
  });
});
