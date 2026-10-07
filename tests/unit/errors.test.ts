import { ERROR_CODES, ERROR_MESSAGES } from "@livrelibre/shared/errors";
import { describe, expect, it } from "vitest";

describe("error messages", () => {
  it("provides a non-empty message for every error code", () => {
    for (const code of Object.values(ERROR_CODES)) {
      expect(ERROR_MESSAGES[code]).toBeTruthy();
    }
  });
});
