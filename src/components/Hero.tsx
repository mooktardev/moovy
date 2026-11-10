import Image from "next/image";
import Link from "next/link";

import { formatYear } from "@/lib/format";
import { mediaDate, mediaTitle } from "@/lib/tmdb";
import { tmdbImage } from "@/lib/images";
import { RatingBadge } from "@/components/RatingBadge";
import type { MediaItem } from "@/types/tmdb";

/** Hero d'accueil : backdrop pleine largeur, dégradé pour la lisibilité — guide de style §6. */
export function Hero({ item }: { item: MediaItem }) {
  const kind = item.media_type === "tv" ? "tv" : "movie";
  const title = mediaTitle(item);
  const backdrop = tmdbImage(item.backdrop_path, "w1280");
  const year = formatYear(mediaDate(item));

  return (
    <section className="relative h-[60vh] max-h-[640px] min-h-[420px]">
      {backdrop ? (
        <Image
          src={backdrop}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : (
        <div className="bg-surface-2 h-full" />
      )}
      <div className="from-background via-background/60 absolute inset-0 bg-gradient-to-t to-transparent" />

      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto max-w-7xl px-4 pb-10 md:px-6">
          <p className="text-muted text-xs font-semibold tracking-widest uppercase">
            {kind === "tv" ? "Série" : "Film"} à la une
          </p>
          <h1 className="font-display mt-2 max-w-3xl text-4xl font-bold md:text-6xl">
            {title}
          </h1>
          <div className="text-muted mt-3 flex items-center gap-3 text-sm">
            {year && <span>{year}</span>}
            <RatingBadge vote={item.vote_average} />
          </div>
          {item.overview && (
            <p className="mt-4 line-clamp-3 max-w-2xl leading-relaxed">
              {item.overview}
            </p>
          )}
          <Link
            href={`/${kind}/${item.id}`}
            className="bg-primary hover:bg-primary/90 focus-visible:ring-primary mt-6 inline-block rounded-lg px-5 py-2.5 font-medium text-white transition duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none"
          >
            Voir la fiche
          </Link>
        </div>
      </div>
    </section>
  );
}
