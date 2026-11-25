import { describe, expect, it } from "vitest";

import {
  metaDescription,
  movieJsonLd,
  pageMetadata,
  rootMetadata,
  personJsonLd,
  serializeJsonLd,
  siteUrl,
  tvJsonLd,
} from "@/lib/seo";
import type { MovieDetails, PersonDetails, TvDetails } from "@/types/tmdb";

const BASE = "https://moovy.test";

describe("siteUrl", () => {
  it("préfère NEXT_PUBLIC_SITE_URL, sans slash final", () => {
    expect(
      siteUrl({
        NEXT_PUBLIC_SITE_URL: "https://moovy.fr/",
        VERCEL_URL: "x.vercel.app",
      }),
    ).toBe("https://moovy.fr");
  });

  it("utilise le domaine de production Vercel en production", () => {
    expect(
      siteUrl({
        VERCEL_ENV: "production",
        VERCEL_PROJECT_PRODUCTION_URL: "moovy-seven.vercel.app",
        VERCEL_URL: "moovy-abc123.vercel.app",
      }),
    ).toBe("https://moovy-seven.vercel.app");
  });

  it("utilise l'URL du déploiement pour une preview", () => {
    expect(
      siteUrl({
        VERCEL_ENV: "preview",
        VERCEL_PROJECT_PRODUCTION_URL: "moovy-seven.vercel.app",
        VERCEL_URL: "moovy-git-feature.vercel.app",
      }),
    ).toBe("https://moovy-git-feature.vercel.app");
  });

  it("retombe sur localhost en dev et sur la prod sinon", () => {
    expect(siteUrl({ NODE_ENV: "development" })).toBe("http://localhost:3000");
    expect(siteUrl({ NODE_ENV: "production" })).toBe(
      "https://moovy-seven.vercel.app",
    );
  });
});

describe("metaDescription", () => {
  it("renvoie le texte court tel quel, espaces normalisés", () => {
    expect(metaDescription("  Un   film\n culte. ", "repli")).toBe(
      "Un film culte.",
    );
  });

  it("utilise le repli pour un texte vide", () => {
    expect(metaDescription(null, "repli")).toBe("repli");
    expect(metaDescription("   ", "repli")).toBe("repli");
  });

  it("coupe sur un mot avec des points de suspension", () => {
    const long = "mot ".repeat(80);
    const result = metaDescription(long, "repli");
    expect(result.length).toBeLessThanOrEqual(160);
    expect(result.endsWith("mot…")).toBe(true);
  });

  it("ne laisse pas de ponctuation avant les points de suspension", () => {
    const text = `${"a".repeat(140)}, ${"b".repeat(40)}`;
    expect(metaDescription(text, "repli")).toBe(`${"a".repeat(140)}…`);
  });
});

describe("rootMetadata", () => {
  it("ne pose ni canonique ni og:url, héritées sinon par toutes les pages", () => {
    const metadata = rootMetadata();
    expect(metadata.alternates).toBeUndefined();
    expect(metadata.openGraph).not.toHaveProperty("url");
    expect(metadata.openGraph).toMatchObject({
      siteName: "Moovy",
      locale: "fr_FR",
    });
  });
});

describe("pageMetadata", () => {
  it("prend « website » par défaut", () => {
    expect(
      pageMetadata({ title: "Films", description: "d", path: "/films" })
        .openGraph,
    ).toMatchObject({ type: "website", url: "/films", siteName: "Moovy" });
  });

  it("renseigne canonique, Open Graph et Twitter", () => {
    expect(
      pageMetadata({
        title: "Fight Club",
        description: "desc",
        path: "/movie/550",
        type: "video.movie",
      }),
    ).toEqual({
      title: "Fight Club",
      description: "desc",
      alternates: { canonical: "/movie/550" },
      openGraph: {
        siteName: "Moovy",
        locale: "fr_FR",
        type: "video.movie",
        title: "Fight Club",
        description: "desc",
        url: "/movie/550",
      },
      twitter: {
        card: "summary_large_image",
        title: "Fight Club",
        description: "desc",
      },
    });
  });
});

const movie: MovieDetails = {
  id: 550,
  title: "Fight Club",
  tagline: null,
  overview: "Un employé de bureau insomniaque…",
  poster_path: "/poster.jpg",
  backdrop_path: null,
  vote_average: 8.438,
  vote_count: 30000,
  release_date: "1999-10-15",
  runtime: 139,
  status: "Released",
  genres: [{ id: 18, name: "Drame" }],
  credits: {
    cast: [
      {
        id: 287,
        name: "Brad Pitt",
        character: "Tyler Durden",
        profile_path: null,
        order: 0,
      },
    ],
  },
};

describe("movieJsonLd", () => {
  it("décrit le film au format schema.org", () => {
    expect(movieJsonLd(movie, BASE)).toEqual({
      "@context": "https://schema.org",
      "@type": "Movie",
      name: "Fight Club",
      url: `${BASE}/movie/550`,
      description: "Un employé de bureau insomniaque…",
      image: "https://image.tmdb.org/t/p/w780/poster.jpg",
      datePublished: "1999-10-15",
      duration: "PT139M",
      genre: ["Drame"],
      actor: [
        { "@type": "Person", name: "Brad Pitt", url: `${BASE}/person/287` },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: 8.4,
        bestRating: 10,
        worstRating: 0,
        ratingCount: 30000,
      },
    });
  });

  it("omet la note sans votes et les champs vides", () => {
    const data = movieJsonLd(
      {
        ...movie,
        vote_count: 0,
        overview: "",
        poster_path: null,
        runtime: null,
        genres: [],
        credits: undefined,
      },
      BASE,
    );
    expect(data).not.toHaveProperty("aggregateRating");
    expect(data).not.toHaveProperty("description");
    expect(data).not.toHaveProperty("image");
    expect(data).not.toHaveProperty("duration");
    expect(data).not.toHaveProperty("genre");
    expect(data).not.toHaveProperty("actor");
  });
});

describe("tvJsonLd", () => {
  it("décrit la série au format schema.org", () => {
    const show: TvDetails = {
      id: 1399,
      name: "Game of Thrones",
      tagline: null,
      overview: null,
      poster_path: null,
      backdrop_path: null,
      vote_average: 8.5,
      vote_count: 25000,
      first_air_date: "2011-04-17",
      episode_run_time: [],
      number_of_seasons: 8,
      number_of_episodes: 73,
      status: "Ended",
      genres: [{ id: 10765, name: "Science-Fiction & Fantastique" }],
    };
    expect(tvJsonLd(show, BASE)).toMatchObject({
      "@type": "TVSeries",
      name: "Game of Thrones",
      url: `${BASE}/tv/1399`,
      startDate: "2011-04-17",
      numberOfSeasons: 8,
      numberOfEpisodes: 73,
      aggregateRating: { ratingValue: 8.5, ratingCount: 25000 },
    });
  });
});

describe("personJsonLd", () => {
  it("décrit la personne au format schema.org", () => {
    const person: PersonDetails = {
      id: 287,
      name: "Brad Pitt",
      biography: "Acteur et producteur américain.",
      birthday: "1963-12-18",
      deathday: null,
      place_of_birth: "Shawnee, Oklahoma, USA",
      profile_path: "/brad.jpg",
      known_for_department: "Acting",
    };
    expect(personJsonLd(person, BASE)).toEqual({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Brad Pitt",
      url: `${BASE}/person/287`,
      description: "Acteur et producteur américain.",
      image: "https://image.tmdb.org/t/p/w780/brad.jpg",
      birthDate: "1963-12-18",
      birthPlace: { "@type": "Place", name: "Shawnee, Oklahoma, USA" },
    });
  });
});

describe("serializeJsonLd", () => {
  it("empêche un texte de fermer la balise <script>", () => {
    const html = serializeJsonLd({
      description: "</script><script>alert(1)</script>",
    });
    expect(html).not.toContain("<");
    expect(JSON.parse(html)).toEqual({
      description: "</script><script>alert(1)</script>",
    });
  });
});
