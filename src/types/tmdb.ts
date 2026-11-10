/**
 * Types des réponses de l'API TMDB (v3), limités aux champs utilisés par Moovy.
 * Les champs optionnels reflètent les différences films / séries
 * (`title` vs `name`, `release_date` vs `first_air_date`).
 */

export type MediaKind = "movie" | "tv";

/** `media_type` complet renvoyé par `/search/multi`, qui inclut les personnes. */
export type SearchMediaType = MediaKind | "person";

/** Tri des catalogues (filtres /films et /series). */
export type SortOption = "popularity" | "rating" | "newest";

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

/** Entrée de liste : film ou série (cartes, carrousels, recherche). */
export interface MediaItem {
  id: number;
  media_type?: SearchMediaType;
  /** Titre du film (`title`) ou de la série (`name`). */
  title?: string;
  name?: string;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  /** Date de sortie du film (AAAA-MM-JJ). */
  release_date?: string | null;
  /** Date de première diffusion de la série (AAAA-MM-JJ). */
  first_air_date?: string | null;
  genre_ids?: number[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface Video {
  id: string;
  /** Clé YouTube. */
  key: string;
  name: string;
  site: "YouTube" | (string & {});
  type: "Trailer" | "Teaser" | "Clip" | (string & {});
  official: boolean;
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
}

export interface WatchProviders {
  link: string | null;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

/** Champs ajoutés via `append_to_response` (crédits, vidéos, similaires, offres). */
interface AppendedDetails {
  credits?: {
    cast: CastMember[];
  };
  videos?: {
    results: Video[];
  };
  similar?: PaginatedResponse<MediaItem>;
  "watch/providers"?: {
    results: Record<string, WatchProviders | undefined>;
  };
}

export interface MovieDetails extends AppendedDetails {
  id: number;
  title: string;
  tagline: string | null;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string | null;
  runtime: number | null;
  status: string;
  genres: Genre[];
}

export interface TvDetails extends AppendedDetails {
  id: number;
  name: string;
  tagline: string | null;
  overview: string | null;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  first_air_date: string | null;
  episode_run_time: number[];
  number_of_seasons: number;
  number_of_episodes: number;
  status: string;
  genres: Genre[];
}

/* ------------------------------------------------------------------ */
/* Personnes (acteurs, réalisateurs…)                                  */
/* ------------------------------------------------------------------ */

/** Personne d'une liste (`/person/popular`). */
export interface PersonSummary {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department: string | null;
}

/** Entrée de filmographie (`combined_credits`) : film ou série. */
export interface PersonCredit {
  id: number;
  media_type: MediaKind;
  /** Film (`title`) ou série (`name`). */
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string | null;
  first_air_date?: string | null;
  /** Personnage interprété (cast). */
  character?: string | null;
}

export interface PersonDetails {
  id: number;
  name: string;
  biography: string | null;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  known_for_department: string | null;
  combined_credits?: {
    cast: PersonCredit[];
  };
}
