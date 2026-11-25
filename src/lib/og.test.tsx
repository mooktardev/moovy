// @vitest-environment node
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";

import { brandImage, detailImage, mediaImage } from "@/lib/og";
import { TmdbError } from "@/lib/tmdb-errors";

/** Image locale en data URI : le test ne dépend pas du réseau. */
const IMAGE = `data:image/jpeg;base64,${readFileSync("docs/captures/fiche-sombre.jpg").toString("base64")}`;
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47];

async function expectPng(response: Response) {
  expect(response.headers.get("content-type")).toBe("image/png");
  const bytes = new Uint8Array(await response.arrayBuffer());
  expect([...bytes.slice(0, 4)]).toEqual(PNG_SIGNATURE);
  return bytes;
}

const card = {
  title: "Fight Club",
  subtitle: "1999 • Drame — « culte »…",
  rating: 8.4,
  poster: IMAGE,
  backdrop: IMAGE,
};

describe("images Open Graph", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rendent sans aucun téléchargement (polices et glyphes embarqués)", async () => {
    // Un glyphe absent des polices déclenche un fetch vers Google Fonts.
    // Les data: URL (module WebAssembly de next/og) restent autorisées.
    const realFetch = globalThis.fetch;
    const networkCalls: string[] = [];
    vi.stubGlobal("fetch", (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input instanceof Request ? input.url : input);
      if (url.startsWith("data:")) return realFetch(input, init);
      networkCalls.push(url);
      return Promise.reject(new Error("réseau interdit"));
    });

    await expectPng(await brandImage());
    await expectPng(await mediaImage(card));
    await expectPng(
      await mediaImage({ ...card, rating: null, poster: null, backdrop: null }),
    );

    expect(networkCalls).toEqual([]);
  }, 30_000);

  it("utilisent la carte générique pour un id invalide ou un 404", async () => {
    const brand = await expectPng(await brandImage());
    const load = vi.fn();

    const invalid = await expectPng(await detailImage("abc", load, () => card));
    expect(load).not.toHaveBeenCalled();

    const missing = await expectPng(
      await detailImage(
        "9",
        vi.fn().mockRejectedValue(new TmdbError(404, "Not Found", "/movie/9")),
        () => card,
      ),
    );

    expect(invalid).toEqual(brand);
    expect(missing).toEqual(brand);
  }, 30_000);

  it("relancent les pannes TMDB (pas d'image en cache)", async () => {
    const outage = new TmdbError(503, "Service Unavailable", "/movie/9");
    await expect(
      detailImage("9", vi.fn().mockRejectedValue(outage), () => card),
    ).rejects.toBe(outage);
  });
});
