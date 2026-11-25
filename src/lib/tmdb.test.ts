import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getMovieDetails, mediaDate, mediaKind, mediaTitle } from "@/lib/tmdb";
import { TmdbError } from "@/lib/tmdb-errors";
import type { MediaItem } from "@/types/tmdb";

const base: MediaItem = {
  id: 1,
  overview: null,
  poster_path: null,
  backdrop_path: null,
  vote_average: 0,
};

describe("helpers de média", () => {
  it("mediaTitle lit title, puis name, puis un libellé par défaut", () => {
    expect(mediaTitle({ ...base, title: "Film" })).toBe("Film");
    expect(mediaTitle({ ...base, name: "Série" })).toBe("Série");
    expect(mediaTitle(base)).toBe("Titre inconnu");
  });

  it("mediaDate lit release_date ou first_air_date", () => {
    expect(mediaDate({ ...base, release_date: "2020-01-01" })).toBe(
      "2020-01-01",
    );
    expect(mediaDate({ ...base, first_air_date: "2011-04-17" })).toBe(
      "2011-04-17",
    );
    expect(mediaDate(base)).toBeNull();
  });

  it("mediaKind retombe sur le type par défaut pour une personne", () => {
    expect(mediaKind({ ...base, media_type: "tv" })).toBe("tv");
    expect(mediaKind({ ...base, media_type: "person" }, "tv")).toBe("tv");
    expect(mediaKind(base)).toBe("movie");
  });
});

describe("tmdbFetch", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    vi.stubEnv("TMDB_ACCESS_TOKEN", "jeton-de-test");
    vi.stubEnv("TMDB_API_KEY", "");
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("envoie le jeton en en-tête et la langue française", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ id: 550, title: "Fight Club" }),
    );

    await expect(getMovieDetails(550)).resolves.toMatchObject({ id: 550 });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(
      /^https:\/\/api\.themoviedb\.org\/3\/movie\/550\?/,
    );
    expect(String(url)).toContain("language=fr-FR");
    expect(String(url)).not.toContain("api_key");
    expect(init.headers.Authorization).toBe("Bearer jeton-de-test");
  });

  it("utilise TMDB_API_URL quand elle est définie", async () => {
    vi.stubEnv("TMDB_API_URL", "http://127.0.0.1:4010/3/");
    fetchMock.mockResolvedValue(Response.json({ id: 550 }));

    await getMovieDetails(550);

    expect(String(fetchMock.mock.calls[0][0])).toMatch(
      /^http:\/\/127\.0\.0\.1:4010\/3\/movie\/550\?/,
    );
  });

  it("utilise la clé v3 en paramètre à défaut de jeton", async () => {
    vi.stubEnv("TMDB_ACCESS_TOKEN", "");
    vi.stubEnv("TMDB_API_KEY", "cle-v3");
    fetchMock.mockResolvedValue(Response.json({ id: 550 }));

    await getMovieDetails(550);

    expect(String(fetchMock.mock.calls[0][0])).toContain("api_key=cle-v3");
  });

  it.each([404, 429, 503])(
    "lève une TmdbError portant le statut %i",
    async (status) => {
      fetchMock.mockResolvedValue(new Response(null, { status }));

      const error = await getMovieDetails(9).catch((caught: unknown) => caught);

      expect(error).toBeInstanceOf(TmdbError);
      expect(error).toMatchObject({ status, path: "/movie/9" });
    },
  );

  it("échoue clairement sans clé configurée", async () => {
    vi.stubEnv("TMDB_ACCESS_TOKEN", "");
    await expect(getMovieDetails(1)).rejects.toThrow(/Clé TMDB manquante/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
