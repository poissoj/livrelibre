import { beforeEach, describe, expect, it } from "vitest";

import { appRouter } from "@livrelibre/server/router";
import { ERROR_CODES } from "@livrelibre/shared/errors";
import { norm } from "@livrelibre/shared/utils";

import { seedCustomer, truncateAll } from "./helpers";

const admin = appRouter.createCaller({
  user: { id: 1, name: "admin", role: "admin" },
});

const customerInput = (fullname: string) => ({
  fullname,
  phone: null,
  email: null,
  contact: "",
  comment: "",
});

describe("updateCustomer duplicates", () => {
  beforeEach(truncateAll);

  it("rejects creating a customer with an existing normalized name", async () => {
    await seedCustomer({
      fullname: "José Dupont",
      nmFullname: norm("José Dupont"),
    });

    await expect(
      admin.updateCustomer({ customer: customerInput("JOSE DUPONT") }),
    ).rejects.toThrow(ERROR_CODES.CUSTOMER_ALREADY_EXISTS);
  });

  it("allows creating a customer with a new name", async () => {
    await seedCustomer({
      fullname: "José Dupont",
      nmFullname: norm("José Dupont"),
    });

    const res = await admin.updateCustomer({
      customer: customerInput("Marie Martin"),
    });
    expect(res.type).toBe("success");
  });

  it("trims the name before checking and storing it", async () => {
    const res = await admin.updateCustomer({
      customer: customerInput("  Marie Martin  "),
    });
    if (res.type !== "success") {
      throw new Error("Expected the customer to be created");
    }

    const created = await admin.customer(res.id);
    expect(created?.fullname).toBe("Marie Martin");

    await expect(
      admin.updateCustomer({ customer: customerInput("Marie Martin") }),
    ).rejects.toThrow(ERROR_CODES.CUSTOMER_ALREADY_EXISTS);
  });

  it("rejects renaming a customer to an existing name", async () => {
    await seedCustomer({
      fullname: "Marie Martin",
      nmFullname: norm("Marie Martin"),
    });
    const other = await seedCustomer({
      fullname: "Jean Dupont",
      nmFullname: norm("Jean Dupont"),
    });

    await expect(
      admin.updateCustomer({
        customerId: other.id,
        customer: customerInput("marie martin"),
      }),
    ).rejects.toThrow(ERROR_CODES.CUSTOMER_ALREADY_EXISTS);
  });

  it("allows updating a customer without changing its name", async () => {
    const customer = await seedCustomer({
      fullname: "Marie Martin",
      nmFullname: norm("Marie Martin"),
    });

    const res = await admin.updateCustomer({
      customerId: customer.id,
      customer: { ...customerInput("Marie Martin"), phone: "0102030405" },
    });
    expect(res.type).toBe("success");

    const updated = await admin.customer(customer.id);
    expect(updated?.phone).toBe("0102030405");
  });
});
