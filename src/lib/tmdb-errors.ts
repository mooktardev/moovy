import type { Metadata } from "next";
import { notFound } from "next/navigation";

/**
 * Erreur HTTP renvoyée par l'API TMDB. Le code de statut permet de
 * distinguer une ressource inexistante (404) d'une panne ou d'un quota
 * dépassé (5xx, 429), qui ne doivent pas s'afficher comme une page 404.
 */
export class TmdbError extends Error {
  readonly status: number;
  readonly path: string;

  constructor(status: number, statusText: string, path: string) {
    super(`TMDB a répondu ${status} (${statusText}) pour ${path}`);
    this.name = "TmdbError";
    this.status = status;
    this.path = path;
  }
}

/** Vrai si l'erreur signale une ressource TMDB inexistante. */
export function isTmdbNotFound(error: unknown): boolean {
  return error instanceof TmdbError && error.status === 404;
}

/**
 * Convertit un segment d'URL en identifiant TMDB (entier strictement
 * positif). Renvoie null pour « abc », « 12abc », « -3 », « 1.5 »…
 */
export function parseTmdbId(raw: string): number | null {
  if (!/^[1-9]\d{0,9}$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) ? id : null;
}

/**
 * Charge une ressource TMDB pour une page de détail :
 * - identifiant invalide ou 404 TMDB → page 404 (`notFound()`) ;
 * - toute autre erreur (panne, 429…) est relancée et atteint `error.tsx`.
 */
export async function loadOrNotFound<T>(
  rawId: string,
  load: (id: number) => Promise<T>,
): Promise<T> {
  const id = parseTmdbId(rawId);
  if (id === null) notFound();
  try {
    return await load(id);
  } catch (error) {
    if (isTmdbNotFound(error)) notFound();
    throw error;
  }
}

/**
 * Metadata d'une fiche pour `generateMetadata` : « introuvable »
 * uniquement pour un id invalide ou un vrai 404 (Next ajoute lui-même
 * `noindex` à la page 404) ; metadata par défaut du site lors d'une
 * panne (l'erreur sera gérée par la page).
 */
export async function detailMetadata<T>(
  rawId: string,
  load: (id: number) => Promise<T>,
  build: (data: T) => Metadata,
  notFoundTitle: string,
): Promise<Metadata> {
  const notFoundMetadata: Metadata = { title: notFoundTitle };
  const id = parseTmdbId(rawId);
  if (id === null) return notFoundMetadata;
  try {
    return build(await load(id));
  } catch (error) {
    return isTmdbNotFound(error) ? notFoundMetadata : {};
  }
}
