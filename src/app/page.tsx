import type { Metadata } from "next";

import { getMovieList, getTrending, getTvList } from "@/lib/tmdb";
import { DEFAULT_TITLE, SITE_DESCRIPTION, pageMetadata } from "@/lib/seo";
import { safe } from "@/lib/safe";
import { Hero } from "@/components/Hero";
import { MediaRail } from "@/components/MediaRail";

export const metadata: Metadata = {
  ...pageMetadata({
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    path: "/",
  }),
  // Titre complet, sans le gabarit « %s | Moovy ».
  title: { absolute: DEFAULT_TITLE },
};

export default async function HomePage() {
  const [trending, popularMovies, topRatedMovies, popularTv] =
    await Promise.all([
      safe(getTrending("all", "week")),
      safe(getMovieList("popular")),
      safe(getMovieList("top_rated")),
      safe(getTvList("popular")),
    ]);

  const hero = trending?.results?.[0];
  const hasHero = Boolean(hero);

  return (
    <div className={hasHero ? "space-y-12 pb-12" : "space-y-12 py-12"}>
      {hero && <Hero item={hero} />}
      {popularMovies && (
        <MediaRail
          title="Films populaires"
          items={popularMovies.results}
          kind="movie"
        />
      )}
      {popularTv && (
        <MediaRail
          title="Séries populaires"
          items={popularTv.results}
          kind="tv"
        />
      )}
      {topRatedMovies && (
        <MediaRail
          title="Les mieux notés"
          items={topRatedMovies.results}
          kind="movie"
        />
      )}
    </div>
  );
}
