import type { Metadata } from "next";

import { getTvList } from "@/lib/tmdb";
import { safe } from "@/lib/safe";
import { MediaGrid } from "@/components/MediaGrid";

export const metadata: Metadata = {
  title: "Séries",
};

export default async function SeriesPage() {
  const shows = await safe(getTvList("popular"));

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-12 md:px-6">
      <h1 className="font-display text-3xl font-bold md:text-4xl">Séries</h1>
      {shows ? (
        <MediaGrid items={shows.results} kind="tv" />
      ) : (
        <p className="text-danger">
          Impossible de charger les séries pour le moment.
        </p>
      )}
    </section>
  );
}
