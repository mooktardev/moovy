import "server-only";

import type {
  Genre,
  MediaItem,
  MediaKind,
  MovieDetails,
  PaginatedResponse,
  SortOption,
  TvDetails,
} from "@/types/tmdb";

const TMDB_API_URL = "https://api.themoviedb.org/3";

/** Durée de mise en cache des réponses TMDB (1 h). */
const REVALIDATE_SECONDS = 3600;

type QueryParams = Record<string, string | number | boolean | undefined>;

/**
 * Appel serveur vers l'API TMDB.
 * Authentification : jeton v4 (`TMDB_ACCESS_TOKEN`) si présent,
 * sinon clé v3 (`TMDB_API_KEY`). Les clés ne quittent jamais le serveur.
 */
async function tmdbFetch<T>(
  path: string,
  params: QueryParams = {},
): Promise<T> {
  const search = new URLSearchParams({
    language: "fr-FR",
    ...Object.fromEntries(
      Object.entries(params)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)]),
    ),
  });

  const headers: Record<string, string> = {
    accept: "application/json",
  };

  if (process.env.TMDB_ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${process.env.TMDB_ACCESS_TOKEN}`;
  } else if (process.env.TMDB_API_KEY) {
    search.set("api_key", process.env.TMDB_API_KEY);
  } else {
    throw new Error(
      "Clé TMDB manquante : renseignez TMDB_API_KEY ou TMDB_ACCESS_TOKEN dans .env.local",
    );
  }

  const response = await fetch(`${TMDB_API_URL}${path}?${search}`, {
    headers,
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(
      `TMDB a répondu ${response.status} (${response.statusText}) pour ${path}`,
    );
  }

  return response.json() as Promise<T>;
}

/* ------------------------------------------------------------------ */
/* Images                                                              */
/* ------------------------------------------------------------------ */

/** Tailles officielles TMDB, mappées selon le contexte (guide de style §7). */
export type TmdbImageSize = "w185" | "w342" | "w780" | "w1280" | "original";

/** Construit l'URL d'une image TMDB ; renvoie null si le chemin est absent. */
export function tmdbImage(
  path: string | null,
  size: TmdbImageSize = "w342",
): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

/* ------------------------------------------------------------------ */
/* Listes et tendances                                                 */
/* ------------------------------------------------------------------ */

export async function getTrending(
  kind: "all" | MediaKind = "all",
  period: "day" | "week" = "week",
): Promise<PaginatedResponse<MediaItem>> {
  return tmdbFetch(`/trending/${kind}/${period}`);
}

export type MovieListName =
  "popular" | "top_rated" | "now_playing" | "upcoming";

export async function getMovieList(
  list: MovieListName,
  page = 1,
): Promise<PaginatedResponse<MediaItem>> {
  return tmdbFetch(`/movie/${list}`, { page });
}

export type TvListName = "popular" | "top_rated" | "on_the_air";

export async function getTvList(
  list: TvListName,
  page = 1,
): Promise<PaginatedResponse<MediaItem>> {
  return tmdbFetch(`/tv/${list}`, { page });
}

export async function searchMulti(
  query: string,
  page = 1,
): Promise<PaginatedResponse<MediaItem>> {
  return tmdbFetch("/search/multi", { query, page, include_adult: false });
}

/* ------------------------------------------------------------------ */
/* Fiches détaillées                                                   */
/* ------------------------------------------------------------------ */

const DETAILS_APPEND = ["credits", "videos", "similar", "watch/providers"].join(
  ",",
);

export async function getMovieDetails(id: number): Promise<MovieDetails> {
  return tmdbFetch(`/movie/${id}`, { append_to_response: DETAILS_APPEND });
}

export async function getTvDetails(id: number): Promise<TvDetails> {
  return tmdbFetch(`/tv/${id}`, { append_to_response: DETAILS_APPEND });
}

/* ------------------------------------------------------------------ */
/* Genres                                                              */
/* ------------------------------------------------------------------ */

export async function getGenres(kind: MediaKind): Promise<Genre[]> {
  const data = await tmdbFetch<{ genres: Genre[] }>(`/genre/${kind}/list`);
  return data.genres;
}

/* ------------------------------------------------------------------ */
/* Catalogues filtrables (discover)                                    */
/* ------------------------------------------------------------------ */

const MOVIE_SORTS: Record<SortOption, string> = {
  popularity: "popularity.desc",
  rating: "vote_average.desc",
  newest: "primary_release_date.desc",
};

const TV_SORTS: Record<SortOption, string> = {
  popularity: "popularity.desc",
  rating: "vote_average.desc",
  newest: "first_air_date.desc",
};

export interface DiscoverParams {
  page?: number;
  genreId?: number | null;
  year?: number | null;
  sort?: SortOption;
}

async function discover(
  kind: MediaKind,
  { page = 1, genreId, year, sort = "popularity" }: DiscoverParams,
): Promise<PaginatedResponse<MediaItem>> {
  return tmdbFetch(kind === "tv" ? "/discover/tv" : "/discover/movie", {
    page,
    sort_by: kind === "tv" ? TV_SORTS[sort] : MOVIE_SORTS[sort],
    with_genres: genreId ?? undefined,
    // Le tri par note exige un minimum de votes, sinon les titres obscurs dominent.
    "vote_count.gte": sort === "rating" ? 300 : undefined,
    // Champs année distincts selon le type de média.
    primary_release_year: kind === "movie" ? (year ?? undefined) : undefined,
    first_air_date_year: kind === "tv" ? (year ?? undefined) : undefined,
  });
}

export function discoverMovies(params: DiscoverParams = {}) {
  return discover("movie", params);
}

export function discoverTv(params: DiscoverParams = {}) {
  return discover("tv", params);
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Titre d'un média, qu'il s'agisse d'un film ou d'une série. */
export function mediaTitle(item: MediaItem): string {
  return item.title ?? item.name ?? "Titre inconnu";
}

/** Date de sortie d'un média, film ou série. */
export function mediaDate(item: MediaItem): string | null {
  return item.release_date ?? item.first_air_date ?? null;
}

/**
 * Type de lien d'une carte. Les personnes renvoyées par `/search/multi`
 * n'ont pas de fiche : on retombe sur le type par défaut de la liste.
 */
export function mediaKind(
  item: MediaItem,
  fallback: MediaKind = "movie",
): MediaKind {
  return item.media_type === "movie" || item.media_type === "tv"
    ? item.media_type
    : fallback;
}
