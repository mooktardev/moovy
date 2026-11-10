import type { Metadata } from "next";

import { getMovieList } from "@/lib/tmdb";
import { safe } from "@/lib/safe";
import { MediaGrid } from "@/components/MediaGrid";

export const metadata: Metadata = {
  title: "Films",
};

export default async function FilmsPage() {
  const movies = await safe(getMovieList("popular"));

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-12 md:px-6">
      <h1 className="font-display text-3xl font-bold md:text-4xl">Films</h1>
      {movies ? (
        <MediaGrid items={movies.results} kind="movie" />
      ) : (
        <p className="text-danger">
          Impossible de charger les films pour le moment.
        </p>
      )}
    </section>
  );
}
