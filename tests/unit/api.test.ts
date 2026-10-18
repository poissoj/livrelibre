import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiFetch } from "../../apps/web/src/utils/api";

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const isPerson = (body: unknown): body is { name: string } =>
  typeof body === "object" && body !== null && "name" in body && typeof body.name === "string";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiFetch", () => {
  it("returns the parsed payload when the guard passes", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ name: "Ada" })));

    await expect(apiFetch("/api/person", {}, isPerson)).resolves.toEqual({ name: "Ada" });
  });

  it("throws a translated ApiError on non-ok responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ error: "UNAUTHORIZED" }, 401)));

    await expect(apiFetch("/api/person", {}, isPerson)).rejects.toMatchObject({
      status: 401,
      code: "UNAUTHORIZED",
      message: "Votre session a expiré, veuillez vous reconnecter.",
    });
  });

  it("throws when the success payload does not match the guard", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ nope: true })));

    await expect(apiFetch("/api/person", {}, isPerson)).rejects.toBeInstanceOf(ApiError);
  });

  it("uses the provided fallback for unknown error codes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ error: "SOMETHING_NEW" }, 500)),
    );

    await expect(
      apiFetch("/api/person", {}, isPerson, "Impossible de charger."),
    ).rejects.toMatchObject({
      status: 500,
      code: "SOMETHING_NEW",
      message: "Impossible de charger.",
    });
  });

  it("propagates network errors", async () => {
    const error = new TypeError("Failed to fetch");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(error));

    await expect(apiFetch("/api/person", {}, isPerson)).rejects.toBe(error);
  });
});
