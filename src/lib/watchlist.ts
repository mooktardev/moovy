import type { MediaItem, MediaKind } from "@/types/tmdb";

/** Entrée de la watchlist : toutes les données nécessaires à l'affichage,
 * capturées au moment de l'ajout (affichage instantané, fonctionne hors-ligne). */
export interface WatchlistItem {
  kind: MediaKind;
  id: number;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  /** Date de sortie (AAAA-MM-JJ), film ou série. */
  date: string | null;
}

/** Convertit un média TMDB en entrée de watchlist. */
export function toWatchlistItem(
  item: MediaItem,
  kind: MediaKind,
): WatchlistItem {
  return {
    kind,
    id: item.id,
    title: item.title ?? item.name ?? "Titre inconnu",
    posterPath: item.poster_path,
    voteAverage: item.vote_average,
    date: item.release_date ?? item.first_air_date ?? null,
  };
}

export function watchlistKey(item: Pick<WatchlistItem, "kind" | "id">): string {
  return `${item.kind}-${item.id}`;
}

const STORAGE_KEY = "moovy:watchlist";

function isWatchlistItem(value: unknown): value is WatchlistItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    (item.kind === "movie" || item.kind === "tv") &&
    typeof item.id === "number" &&
    typeof item.title === "string"
  );
}

/** Lit la watchlist du navigateur ; renvoie [] côté serveur ou si invalide. */
export function readWatchlist(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isWatchlistItem) : [];
  } catch {
    return [];
  }
}

export function writeWatchlist(items: WatchlistItem[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Quota dépassé ou mode privé : on ignore, la liste restera en mémoire.
  }
}
