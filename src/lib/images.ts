/** Tailles officielles TMDB, mappées selon le contexte (guide de style §7). */
export type TmdbImageSize = "w185" | "w342" | "w780" | "w1280" | "original";

/** Construit l'URL d'une image TMDB ; renvoie null si le chemin est absent.
 * Module client-safe : aucune donnée secrète ici, uniquement des URLs publiques. */
export function tmdbImage(
  path: string | null,
  size: TmdbImageSize = "w342",
): string | null {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
