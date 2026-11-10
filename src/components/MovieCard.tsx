import Image from "next/image";
import Link from "next/link";

import { formatYear } from "@/lib/format";
import { mediaDate, mediaTitle } from "@/lib/tmdb";
import { tmdbImage } from "@/lib/images";
import { toWatchlistItem } from "@/lib/watchlist";
import { PosterPlaceholder } from "@/components/PosterPlaceholder";
import { RatingBadge } from "@/components/RatingBadge";
import { WatchlistButton } from "@/components/WatchlistButton";
import type { MediaItem } from "@/types/tmdb";

interface MovieCardProps {
  item: MediaItem;
  kind: "movie" | "tv";
}

/**
 * Carte média : affiche 2:3, note en surimpression, titre et année —
 * guide de style §6. Le bouton favori est hors du lien (pas d'éléments
 * interactifs imbriqués) mais visuellement posé sur l'affiche.
 */
export function MovieCard({ item, kind }: MovieCardProps) {
  const title = mediaTitle(item);
  const poster = tmdbImage(item.poster_path, "w342");
  const year = formatYear(mediaDate(item));

  return (
    <div className="group relative">
      <Link
        href={`/${kind}/${item.id}`}
        className="rounded-card focus-visible:ring-primary block focus-visible:ring-2 focus-visible:outline-none"
      >
        <div className="rounded-card bg-surface-2 group-focus-visible:ring-primary/60 group-hover:ring-primary/60 relative aspect-[2/3] overflow-hidden transition duration-200 ease-out group-hover:ring-2 group-focus-visible:ring-2 motion-reduce:transition-none">
          {poster ? (
            <Image
              src={poster}
              alt={`Affiche de ${title}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              className="object-cover transition-transform duration-200 ease-out group-hover:scale-105 motion-reduce:transform-none"
            />
          ) : (
            <PosterPlaceholder />
          )}
          <div className="absolute top-2 left-2">
            <RatingBadge vote={item.vote_average} />
          </div>
        </div>

        <h3 className="mt-2 line-clamp-2 text-sm font-medium">{title}</h3>
        {year && <p className="text-muted text-xs">{year}</p>}
      </Link>

      <div className="absolute top-2 right-2 z-10">
        <WatchlistButton item={toWatchlistItem(item, kind)} />
      </div>
    </div>
  );
}
