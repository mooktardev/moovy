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

export const WATCHLIST_STORAGE_KEY = "moovy:watchlist";

function isWatchlistItem(value: unknown): value is WatchlistItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    (item.kind === "movie" || item.kind === "tv") &&
    typeof item.id === "number" &&
    typeof item.title === "string"
  );
}

/** Décode la valeur brute du stockage ; [] si absente ou invalide. */
function parseWatchlist(raw: string | null): WatchlistItem[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isWatchlistItem) : [];
  } catch {
    return [];
  }
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(WATCHLIST_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Lit la watchlist du navigateur ; renvoie [] côté serveur ou si invalide. */
export function readWatchlist(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  return parseWatchlist(readRaw());
}

/** Écrit la watchlist ; renvoie false si le stockage est indisponible. */
export function writeWatchlist(items: WatchlistItem[]): boolean {
  try {
    window.localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch {
    // Quota dépassé ou mode privé.
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Store externe (useSyncExternalStore)                                */
/* ------------------------------------------------------------------ */

const EMPTY: WatchlistItem[] = [];
const listeners = new Set<() => void>();

/** Dernier instantané décodé, réutilisé tant que la valeur brute ne change
 * pas : `getSnapshot` doit renvoyer la même référence entre deux appels. */
let cache: { raw: string | null; items: WatchlistItem[] } | null = null;
/** Liste gardée en mémoire quand le stockage refuse l'écriture. */
let memory: WatchlistItem[] | null = null;

function emit() {
  for (const listener of listeners) listener();
}

/** Un autre onglet a modifié la liste : on relit le stockage. */
function onStorage(event: StorageEvent) {
  if (event.key !== WATCHLIST_STORAGE_KEY) return;
  memory = null;
  emit();
}

export function subscribeWatchlist(listener: () => void): () => void {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function getWatchlistSnapshot(): WatchlistItem[] {
  if (memory) return memory;
  const raw = readRaw();
  if (cache?.raw !== raw) cache = { raw, items: parseWatchlist(raw) };
  return cache.items;
}

/** Instantané du rendu serveur et de l'hydratation : liste vide. */
export function getWatchlistServerSnapshot(): WatchlistItem[] {
  return EMPTY;
}

/** Remplace la liste à partir de la liste courante. */
export function updateWatchlist(
  update: (items: WatchlistItem[]) => WatchlistItem[],
): void {
  const next = update(getWatchlistSnapshot());
  memory = writeWatchlist(next) ? null : next;
  emit();
}
