import Image from "next/image";
import Link from "next/link";

import { tmdbImage } from "@/lib/images";
import { toWatchlistItem, type WatchlistItem } from "@/lib/watchlist";
import { MediaRail } from "@/components/MediaRail";
import { PosterPlaceholder } from "@/components/PosterPlaceholder";
import { RatingRing } from "@/components/RatingRing";
import { WatchlistButton } from "@/components/WatchlistButton";
import { WatchProviders } from "@/components/WatchProviders";
import type {
  CastMember,
  MediaItem,
  MediaKind,
  WatchProviders as WatchProvidersData,
} from "@/types/tmdb";

interface MediaDetailsProps {
  title: string;
  tagline: string | null;
  overview: string | null;
  backdrop: string | null;
  poster: string | null;
  year: string | null;
  rating: number;
  /** Ligne d'infos secondaires, ex. « 2024 • 2 h 15 • Action, Aventure ». */
  metaLine: string | null;
  trailerUrl: string | null;
  cast: CastMember[];
  similar: MediaItem[];
  similarKind: MediaKind;
  /** Données pour le bouton « Ajouter à ma liste ». */
  media: MediaItem;
  /** Offres de streaming par pays (optionnel). */
  providers?: Record<string, WatchProvidersData | undefined>;
}

/** Fiche détaillée commune aux films et aux séries. */
export function MediaDetails({
  title,
  tagline,
  overview,
  backdrop,
  poster,
  year,
  rating,
  metaLine,
  trailerUrl,
  cast,
  similar,
  similarKind,
  media,
  providers,
}: MediaDetailsProps) {
  const watchlistItem: WatchlistItem = toWatchlistItem(media, similarKind);
  return (
    <article className="pb-12">
      {/* Bandeau backdrop */}
      <div className="relative h-[32vh] max-h-[400px] min-h-[220px]">
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
        <div className="from-background via-background/50 absolute inset-0 bg-gradient-to-t to-transparent" />
      </div>

      {/* En-tête : affiche + infos, sous le bandeau (titre toujours lisible) */}
      <div className="mx-auto max-w-7xl px-4 pt-6 md:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="rounded-card bg-surface-2 ring-border relative aspect-[2/3] w-36 shrink-0 overflow-hidden ring-1 sm:w-44">
            {poster ? (
              <Image
                src={poster}
                alt={`Affiche de ${title}`}
                fill
                sizes="176px"
                className="object-cover"
              />
            ) : (
              <PosterPlaceholder />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl font-bold md:text-4xl">
              {title}
            </h1>
            {tagline && <p className="text-muted mt-1 italic">« {tagline} »</p>}
            <div className="text-muted mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
              {rating > 0 && <RatingRing vote={rating} />}
              {year && <span>{year}</span>}
              {metaLine && <span>{metaLine}</span>}
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {trailerUrl && (
                <Link
                  href={trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary hover:bg-primary/90 focus-visible:ring-primary inline-block rounded-lg px-5 py-2.5 font-medium text-white transition duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none"
                >
                  Bande-annonce
                </Link>
              )}
              <WatchlistButton item={watchlistItem} variant="inline" />
            </div>
          </div>
        </div>
      </div>

      {/* Synopsis */}
      {overview && (
        <section className="mx-auto mt-10 max-w-7xl px-4 md:px-6">
          <h2 className="font-display text-xl font-semibold md:text-2xl">
            Synopsis
          </h2>
          <p className="mt-3 max-w-prose leading-relaxed">{overview}</p>
        </section>
      )}

      {/* Casting */}
      {cast.length > 0 && (
        <section className="mx-auto mt-10 max-w-7xl px-4 md:px-6">
          <h2 className="font-display text-xl font-semibold md:text-2xl">
            Casting principal
          </h2>
          <ul className="mt-4 flex scrollbar-none gap-4 overflow-x-auto pb-2">
            {cast.map((member) => {
              const profile = tmdbImage(member.profile_path, "w185");
              return (
                <li key={member.id} className="w-28 shrink-0">
                  <Link
                    href={`/person/${member.id}`}
                    className="group rounded-card focus-visible:ring-primary block focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <div className="rounded-card bg-surface-2 group-focus-visible:ring-primary/60 group-hover:ring-primary/60 relative aspect-[2/3] overflow-hidden transition duration-200 ease-out group-hover:ring-2 group-focus-visible:ring-2 motion-reduce:transition-none">
                      {profile && (
                        <Image
                          src={profile}
                          alt={`Photo de ${member.name}`}
                          fill
                          sizes="112px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm font-medium">
                      {member.name}
                    </p>
                    <p className="text-muted line-clamp-1 text-xs">
                      {member.character}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Où regarder */}
      {providers && <WatchProviders providers={providers} />}

      {/* Recommandations */}
      {similar.length > 0 && (
        <div className="mt-10">
          <MediaRail title="Similaires" items={similar} kind={similarKind} />
        </div>
      )}
    </article>
  );
}
