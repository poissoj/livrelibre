import { describe, expect, it } from "vitest";

import { formatDate, formatDateFR, toInputDate } from "@livrelibre/shared/date";

describe("formatDate", () => {
  it("formats a date as ISO (YYYY-MM-DD)", () => {
    expect(formatDate(new Date(2024, 0, 5))).toBe("2024-01-05");
  });

  it("pads single-digit month and day", () => {
    expect(formatDate(new Date(2024, 10, 3))).toBe("2024-11-03");
  });

  it("handles the last day of the year", () => {
    expect(formatDate(new Date(2024, 11, 31))).toBe("2024-12-31");
  });
});

describe("formatDateFR", () => {
  it("formats a date as DD/MM/YYYY", () => {
    expect(formatDateFR(new Date(2024, 0, 5))).toBe("05/01/2024");
  });

  it("pads single-digit month and day", () => {
    expect(formatDateFR(new Date(2024, 10, 3))).toBe("03/11/2024");
  });
});

describe("toInputDate", () => {
  it("formats for a datetime-local input", () => {
    expect(toInputDate(new Date(2024, 0, 5, 14, 30))).toBe("2024-01-05T14:30");
  });
});
