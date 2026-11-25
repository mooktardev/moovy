import { describe, expect, it, vi } from "vitest";

import {
  TmdbError,
  isTmdbNotFound,
  detailMetadata,
  loadOrNotFound,
  parseTmdbId,
} from "@/lib/tmdb-errors";

/** Erreur levée par `notFound()` de Next (digest « …;404 »). */
const NOT_FOUND = expect.objectContaining({
  digest: expect.stringMatching(/;404$/),
});

describe("parseTmdbId", () => {
  it.each([
    ["550", 550],
    ["1", 1],
    ["1399", 1399],
  ])("accepte %s", (raw, expected) => {
    expect(parseTmdbId(raw)).toBe(expected);
  });

  it.each([
    "",
    "abc",
    "12abc",
    "-3",
    "0",
    "007",
    "1.5",
    " 550",
    "1e3",
    "99999999999",
  ])("refuse %j", (raw) => {
    expect(parseTmdbId(raw)).toBeNull();
  });
});

describe("isTmdbNotFound", () => {
  it("reconnaît un 404 TMDB", () => {
    expect(isTmdbNotFound(new TmdbError(404, "Not Found", "/movie/1"))).toBe(
      true,
    );
  });

  it("ignore les autres statuts et erreurs", () => {
    expect(isTmdbNotFound(new TmdbError(500, "Server Error", "/movie/1"))).toBe(
      false,
    );
    expect(
      isTmdbNotFound(new TmdbError(429, "Too Many Requests", "/movie/1")),
    ).toBe(false);
    expect(isTmdbNotFound(new Error("404"))).toBe(false);
    expect(isTmdbNotFound(null)).toBe(false);
  });
});

describe("loadOrNotFound", () => {
  it("renvoie les données avec l'identifiant numérique", async () => {
    const load = vi.fn(async (id: number) => ({ id }));
    await expect(loadOrNotFound("550", load)).resolves.toEqual({ id: 550 });
    expect(load).toHaveBeenCalledWith(550);
  });

  it("déclenche notFound() sans appeler TMDB pour un id invalide", async () => {
    const load = vi.fn();
    await expect(loadOrNotFound("abc", load)).rejects.toEqual(NOT_FOUND);
    expect(load).not.toHaveBeenCalled();
  });

  it("déclenche notFound() sur un 404 TMDB", async () => {
    const load = vi
      .fn()
      .mockRejectedValue(new TmdbError(404, "Not Found", "/movie/9"));
    await expect(loadOrNotFound("9", load)).rejects.toEqual(NOT_FOUND);
  });

  it("relance les pannes TMDB pour qu'elles atteignent error.tsx", async () => {
    const outage = new TmdbError(503, "Service Unavailable", "/movie/9");
    const load = vi.fn().mockRejectedValue(outage);
    await expect(loadOrNotFound("9", load)).rejects.toBe(outage);
  });

  it("relance les erreurs réseau", async () => {
    const network = new TypeError("fetch failed");
    await expect(
      loadOrNotFound("9", vi.fn().mockRejectedValue(network)),
    ).rejects.toBe(network);
  });
});

describe("detailMetadata", () => {
  const build = (data: { title: string }) => ({
    title: data.title,
    description: "desc",
  });
  const notFoundMetadata = { title: "Introuvable" };

  it("construit la metadata depuis la ressource", async () => {
    await expect(
      detailMetadata(
        "550",
        async () => ({ title: "Fight Club" }),
        build,
        "Introuvable",
      ),
    ).resolves.toEqual({ title: "Fight Club", description: "desc" });
  });

  it("affiche « introuvable » pour un id invalide ou un 404", async () => {
    await expect(
      detailMetadata("abc", vi.fn(), build, "Introuvable"),
    ).resolves.toEqual(notFoundMetadata);
    await expect(
      detailMetadata(
        "9",
        vi.fn().mockRejectedValue(new TmdbError(404, "Not Found", "/x")),
        build,
        "Introuvable",
      ),
    ).resolves.toEqual(notFoundMetadata);
  });

  it("garde la metadata par défaut lors d'une panne", async () => {
    await expect(
      detailMetadata(
        "9",
        vi.fn().mockRejectedValue(new TmdbError(500, "Error", "/x")),
        build,
        "Introuvable",
      ),
    ).resolves.toEqual({});
  });
});
