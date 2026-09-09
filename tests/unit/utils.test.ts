import { describe, expect, it } from "vitest";

import { isDefined, isIn, norm, sanitize } from "@livrelibre/shared/utils";

describe("norm", () => {
  it("removes diacritics", () => {
    expect(norm("éàçô")).toBe("eaco");
  });

  it("normalizes a full title", () => {
    expect(norm("La délicatesse")).toBe("La delicatesse");
  });

  it("leaves plain strings unchanged", () => {
    expect(norm("abc123")).toBe("abc123");
  });
});

describe("sanitize", () => {
  it("escapes a dot (regex wildcard)", () => {
    expect(sanitize("a.b")).toBe("a\\.b");
  });

  it("escapes square brackets (character class)", () => {
    expect(sanitize("a[b]")).toBe("a\\[b\\]");
  });

  it("escapes curly braces (quantifier)", () => {
    expect(sanitize("a{b}")).toBe("a\\{b\\}");
  });

  it("leaves plain strings unchanged", () => {
    expect(sanitize("plain")).toBe("plain");
  });
});

describe("isIn", () => {
  const target: Record<string, unknown> = { a: 1 };

  it("returns true when the property exists", () => {
    expect(isIn(target, "a")).toBe(true);
  });

  it("returns false when the property is missing", () => {
    expect(isIn(target, "b")).toBe(false);
  });
});

describe("isDefined", () => {
  it("returns true for falsy-but-defined values", () => {
    expect(isDefined(0)).toBe(true);
    expect(isDefined("")).toBe(true);
    expect(isDefined(false)).toBe(true);
  });

  it("returns false for null and undefined", () => {
    expect(isDefined(null)).toBe(false);
    expect(isDefined(undefined)).toBe(false);
  });
});
