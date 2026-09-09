import { beforeEach, describe, expect, it } from "vitest";

import { db } from "@livrelibre/server/db/database";
import { purchases } from "@livrelibre/shared/schema";
import {
  addPurchase,
  deleteCustomer,
  getCustomer,
  getCustomers,
  newCustomer,
} from "@livrelibre/server/server/customers";
import { seedCustomer, truncateAll } from "./helpers";

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
    if (res.type !== "success") {
      throw new Error("expected success");
    }
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
});
