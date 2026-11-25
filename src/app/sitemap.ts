import type { MetadataRoute } from "next";

import { safe } from "@/lib/safe";
import { siteUrl } from "@/lib/seo";
import {
  getMovieList,
  getPopularPeople,
  getTrending,
  getTvList,
} from "@/lib/tmdb";
import type { MediaItem } from "@/types/tmdb";

/** Pages de navigation indexables. */
const STATIC_PATHS = ["/", "/films", "/series", "/acteurs"];

/**
 * Plan du site : pages de navigation + fiches mises en avant sur le site
 * (tendances, populaires, mieux notés, acteurs populaires). Une panne TMDB
 * n'empêche pas sa génération : les pages statiques restent listées.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [trending, popularMovies, topMovies, popularTv, topTv, people] =
    await Promise.all([
      safe(getTrending("all", "week")),
      safe(getMovieList("popular")),
      safe(getMovieList("top_rated")),
      safe(getTvList("popular")),
      safe(getTvList("top_rated")),
      safe(getPopularPeople()),
    ]);

  const paths = new Set<string>();
  const addMedia = (items: MediaItem[] | undefined, kind: "movie" | "tv") => {
    for (const item of items ?? []) {
      const type = item.media_type ?? kind;
      if (type === "movie" || type === "tv") paths.add(`/${type}/${item.id}`);
    }
  };
  addMedia(trending?.results, "movie");
  addMedia(popularMovies?.results, "movie");
  addMedia(topMovies?.results, "movie");
  addMedia(popularTv?.results, "tv");
  addMedia(topTv?.results, "tv");
  for (const person of people?.results ?? []) paths.add(`/person/${person.id}`);

  return [
    ...STATIC_PATHS.map((path) => ({
      url: `${base}${path}`,
      changeFrequency: "daily" as const,
      priority: path === "/" ? 1 : 0.8,
    })),
    ...[...paths].map((path) => ({
      url: `${base}${path}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
