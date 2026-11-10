import { Suspense } from "react";
import type { Metadata } from "next";

import { searchMulti } from "@/lib/tmdb";
import { safe } from "@/lib/safe";
import { MediaGrid } from "@/components/MediaGrid";
import { MediaGridSkeleton } from "@/components/MediaGridSkeleton";

export const metadata: Metadata = {
  title: "Recherche",
};

export default async function SearchPage(props: PageProps<"/search">) {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchResults searchParams={props.searchParams} />
    </Suspense>
  );
}

/** Skeleton plein écran pendant que la requête arrive. */
function SearchFallback() {
  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-12 md:px-6">
      <div className="bg-surface-2 h-8 w-1/3 animate-pulse rounded-lg" />
      <MediaGridSkeleton />
    </section>
  );
}

/** Accède à searchParams (API runtime) : doit vivre sous Suspense. */
async function SearchResults({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";

  if (!query) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-24 text-center md:px-6">
        <p className="text-muted text-lg">
          Rechercher un film ou une série pour afficher les résultats.
        </p>
      </section>
    );
  }

  const data = await safe(searchMulti(query));
  if (!data) {
    return (
      <section className="mx-auto max-w-7xl space-y-6 px-4 py-12 md:px-6">
        <h1 className="font-display text-3xl font-bold md:text-4xl">
          Recherche
        </h1>
        <p className="text-danger">
          Impossible d&apos;effectuer la recherche pour le moment.
        </p>
      </section>
    );
  }

  // searchMulti renvoie aussi des personnes : on ne garde que films et séries.
  const results = data.results.filter((item) => item.media_type !== "person");

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-12 md:px-6">
      <h1 className="font-display text-3xl font-bold md:text-4xl">Recherche</h1>
      {results.length > 0 ? (
        <>
          <p className="text-muted text-sm">
            {results.length} résultat{results.length > 1 ? "s" : ""} pour{" "}
            <span className="text-foreground font-medium">« {query} »</span>
          </p>
          <MediaGrid items={results} kind="movie" />
        </>
      ) : (
        <p className="text-muted">
          Aucun résultat pour « {query} ». Essayez un autre titre.
        </p>
      )}
    </section>
  );
}
