import type { Metadata } from "next";

import { tmdbImage } from "@/lib/images";
import type {
  CastMember,
  MovieDetails,
  PersonDetails,
  TvDetails,
} from "@/types/tmdb";

export const SITE_NAME = "Moovy";
export const SITE_DESCRIPTION =
  "Découvrez les films et séries du moment : tendances, fiches détaillées, casting et bandes-annonces.";

/** URL de production, utilisée si aucune variable d'environnement ne la donne. */
const FALLBACK_SITE_URL = "https://moovy-seven.vercel.app";

/**
 * URL absolue du site (sans « / » final), pour `metadataBase`, le sitemap
 * et le JSON-LD. Ordre : `NEXT_PUBLIC_SITE_URL` explicite, domaine de
 * production Vercel, URL du déploiement (previews), localhost en dev.
 */
export function siteUrl(
  env: Record<string, string | undefined> = process.env,
): string {
  const explicit = env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  if (env.VERCEL_ENV === "production" && env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (env.VERCEL_URL) return `https://${env.VERCEL_URL}`;
  if (env.NODE_ENV === "development") return "http://localhost:3000";
  return FALLBACK_SITE_URL;
}

/**
 * Description courte pour les balises meta (≈ 160 caractères max) :
 * espaces normalisés, coupure sur un mot, points de suspension.
 */
export function metaDescription(
  text: string | null | undefined,
  fallback: string,
  max = 160,
): string {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return fallback;
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.!?-]+$/, "")}…`;
}

/* ------------------------------------------------------------------ */
/* Metadata des pages                                                  */
/* ------------------------------------------------------------------ */

export const DEFAULT_TITLE = "Moovy — Films & séries";

/** Champs Open Graph communs : Next remplace l'objet `openGraph` d'un
 * parent au lieu de le fusionner, chaque page doit donc les reprendre. */
const BASE_OPEN_GRAPH = { siteName: SITE_NAME, locale: "fr_FR" } as const;

interface PageSeo {
  title: string;
  description: string;
  /** Chemin canonique, ex. « /movie/550 ». */
  path: string;
  type?: "website" | "video.movie" | "video.tv_show" | "profile";
}

/**
 * Metadata d'une page indexable : description, URL canonique, Open Graph
 * et Twitter. L'image vient du fichier `opengraph-image.tsx` le plus
 * proche. La canonique n'est jamais posée dans le layout, sinon toutes
 * les pages qui n'en définissent pas hériteraient de celle de l'accueil.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = "website",
}: PageSeo): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { ...BASE_OPEN_GRAPH, type, title, description, url: path },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** Metadata par défaut du layout racine : ni canonique, ni URL. */
export function rootMetadata(): Metadata {
  return {
    metadataBase: new URL(siteUrl()),
    applicationName: SITE_NAME,
    title: { default: DEFAULT_TITLE, template: `%s | ${SITE_NAME}` },
    description: SITE_DESCRIPTION,
    openGraph: {
      ...BASE_OPEN_GRAPH,
      type: "website",
      title: DEFAULT_TITLE,
      description: SITE_DESCRIPTION,
    },
    twitter: {
      card: "summary_large_image",
      title: DEFAULT_TITLE,
      description: SITE_DESCRIPTION,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Données structurées (schema.org, JSON-LD)                           */
/* ------------------------------------------------------------------ */

type JsonLd = Record<string, unknown>;

/**
 * Sérialise le JSON-LD pour un <script> : `<` est échappé pour qu'un
 * texte TMDB contenant « </script> » ne puisse pas fermer la balise.
 */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** Retire les champs vides pour un JSON-LD propre. */
function compact(data: JsonLd): JsonLd {
  return Object.fromEntries(
    Object.entries(data).filter(
      ([, value]) =>
        value !== null &&
        value !== undefined &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0),
    ),
  );
}

function aggregateRating(average: number, count: number | undefined) {
  // Google exige un nombre de votes : sans lui, pas de note structurée.
  if (!count || count <= 0) return undefined;
  return {
    "@type": "AggregateRating",
    ratingValue: Math.round(average * 10) / 10,
    bestRating: 10,
    worstRating: 0,
    ratingCount: count,
  };
}

function actors(cast: CastMember[] | undefined, base: string) {
  return (cast ?? []).slice(0, 10).map((member) => ({
    "@type": "Person",
    name: member.name,
    url: `${base}/person/${member.id}`,
  }));
}

export function movieJsonLd(movie: MovieDetails, base: string): JsonLd {
  return compact({
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    url: `${base}/movie/${movie.id}`,
    description: movie.overview,
    image: tmdbImage(movie.poster_path, "w780"),
    datePublished: movie.release_date,
    duration: movie.runtime ? `PT${movie.runtime}M` : null,
    genre: movie.genres.map((genre) => genre.name),
    actor: actors(movie.credits?.cast, base),
    aggregateRating: aggregateRating(movie.vote_average, movie.vote_count),
  });
}

export function tvJsonLd(show: TvDetails, base: string): JsonLd {
  return compact({
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name: show.name,
    url: `${base}/tv/${show.id}`,
    description: show.overview,
    image: tmdbImage(show.poster_path, "w780"),
    startDate: show.first_air_date,
    numberOfSeasons: show.number_of_seasons || null,
    numberOfEpisodes: show.number_of_episodes || null,
    genre: show.genres.map((genre) => genre.name),
    actor: actors(show.credits?.cast, base),
    aggregateRating: aggregateRating(show.vote_average, show.vote_count),
  });
}

export function personJsonLd(person: PersonDetails, base: string): JsonLd {
  return compact({
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    url: `${base}/person/${person.id}`,
    description: person.biography,
    image: tmdbImage(person.profile_path, "w780"),
    birthDate: person.birthday,
    deathDate: person.deathday,
    birthPlace: person.place_of_birth
      ? { "@type": "Place", name: person.place_of_birth }
      : null,
  });
}
