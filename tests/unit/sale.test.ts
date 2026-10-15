import { loyaltyDiscount } from "@livrelibre/shared/sale";
import { describe, expect, it } from "vitest";

describe("loyaltyDiscount", () => {
  it("computes a discount for the given percent", () => {
    expect(loyaltyDiscount(100, 3)).toBe(3);
    expect(loyaltyDiscount(200, 3)).toBe(6);
  });

  it("supports a decimal percent", () => {
    expect(loyaltyDiscount(100, 5.5)).toBe(5.5);
  });

  it("rounds to the cent", () => {
    expect(loyaltyDiscount(19.99, 3)).toBe(0.6);
  });

  it("returns zero for a zero percent", () => {
    expect(loyaltyDiscount(100, 0)).toBe(0);
  });
});
