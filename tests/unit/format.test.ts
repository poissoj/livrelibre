import { describe, expect, it } from "vitest";

import {
  formatNumber,
  formatPercent,
  formatPrice,
  formatTVA,
} from "@/utils/format";

// Note: these functions use `Intl.NumberFormat` with the runtime default
// locale, so assertions on exact strings are locale-dependent. The tests below
// are written to be locale-agnostic.

describe("formatPrice", () => {
  it("formats a price as EUR currency", () => {
    const result = formatPrice(10);
    expect(typeof result).toBe("string");
    expect(result).toContain("10");
    expect(result).toContain("€");
  });

  it("formats zero", () => {
    expect(formatPrice(0)).toContain("0");
  });
});

describe("formatPercent", () => {
  it("formats a fraction as a percentage", () => {
    expect(formatPercent(0.2)).toContain("20");
    expect(formatPercent(0.2)).toContain("%");
  });
});

describe("formatNumber", () => {
  it("formats a decimal number", () => {
    expect(formatNumber(1234.5)).toContain("234");
  });
});

describe("formatTVA", () => {
  it("returns null unchanged", () => {
    expect(formatTVA(null)).toBeNull();
  });

  it("returns undefined unchanged", () => {
    expect(formatTVA(undefined)).toBeUndefined();
  });

  it("returns an empty string unchanged", () => {
    expect(formatTVA("")).toBe("");
  });

  it("returns the 'Inconnu' sentinel unchanged", () => {
    expect(formatTVA("Inconnu")).toBe("Inconnu");
  });

  it("converts a numeric string to a percentage", () => {
    expect(formatTVA("20")).toBe(formatPercent(0.2));
    expect(formatTVA("5.5")).toBe(formatPercent(0.055));
  });
});
