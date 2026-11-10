"use client";

import Image from "next/image";
import Link from "next/link";

import { formatYear } from "@/lib/format";
import { tmdbImage } from "@/lib/images";
import { watchlistKey, type WatchlistItem } from "@/lib/watchlist";
import { MediaGridSkeleton } from "@/components/MediaGridSkeleton";
import { PosterPlaceholder } from "@/components/PosterPlaceholder";
import { RatingBadge } from "@/components/RatingBadge";
import { WatchlistButton } from "@/components/WatchlistButton";
import { useWatchlist } from "@/components/WatchlistProvider";

function WatchlistCard({ item }: { item: WatchlistItem }) {
  const poster = tmdbImage(item.posterPath, "w342");
  const year = formatYear(item.date);

  return (
    <div className="group relative">
      <Link
        href={`/${item.kind}/${item.id}`}
        className="rounded-card focus-visible:ring-primary block focus-visible:ring-2 focus-visible:outline-none"
      >
        <div className="rounded-card bg-surface-2 group-hover:ring-primary/60 relative aspect-[2/3] overflow-hidden transition duration-200 ease-out group-hover:ring-2 motion-reduce:transition-none">
          {poster ? (
            <Image
              src={poster}
              alt={`Affiche de ${item.title}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              className="object-cover transition-transform duration-200 ease-out group-hover:scale-105 motion-reduce:transform-none"
            />
          ) : (
            <PosterPlaceholder />
          )}
          <div className="absolute top-2 left-2">
            <RatingBadge vote={item.voteAverage} />
          </div>
        </div>
        <h2 className="mt-2 line-clamp-2 text-sm font-medium">{item.title}</h2>
        {year && <p className="text-muted text-xs">{year}</p>}
      </Link>
      <div className="absolute top-2 right-2 z-10">
        <WatchlistButton item={item} />
      </div>
    </div>
  );
}

/** Vue « Ma liste » : rendue côté client, données depuis localStorage. */
export function MaListeView() {
  const { items, hydrated, clear } = useWatchlist();

  if (!hydrated) {
    return (
      <section className="mx-auto max-w-7xl space-y-6 px-4 py-12 md:px-6">
        <div className="bg-surface-2 h-9 w-40 animate-pulse rounded-lg" />
        <MediaGridSkeleton />
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-24 text-center md:px-6">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-muted mx-auto size-12"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
          />
        </svg>
        <p className="text-foreground mt-4 text-lg">
          Votre liste est vide pour le moment.
        </p>
        <p className="text-muted mt-1">
          Ajoutez des films et des séries avec le cœur sur les affiches.
        </p>
        <Link
          href="/films"
          className="bg-primary hover:bg-primary/90 focus-visible:ring-primary mt-6 inline-block rounded-lg px-5 py-2.5 font-medium text-white transition duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none"
        >
          Explorer les films
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-12 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-bold md:text-4xl">
          Ma liste
        </h1>
        <div className="flex items-center gap-3">
          <p className="text-muted text-sm">
            {items.length} titre{items.length > 1 ? "s" : ""}
          </p>
          <button
            type="button"
            onClick={clear}
            className="border-border bg-surface-2 text-foreground hover:bg-surface focus-visible:ring-primary rounded-lg border px-4 py-2 text-sm transition duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none"
          >
            Tout retirer
          </button>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((item) => (
          <li key={watchlistKey(item)}>
            <WatchlistCard item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
}
