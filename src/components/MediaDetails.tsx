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
      {/* Hero : couverture étendue, contenu superposé sur dégradé */}
      <div className="from-surface-2 to-background relative h-[50vh] max-h-[640px] min-h-[320px] overflow-hidden bg-gradient-to-b">
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

        {/* Dégradé de lisibilité pour le contenu superposé */}
        <div className="from-background via-background/70 absolute inset-0 bg-gradient-to-t to-transparent" />

        {/* En-tête superposé : affiche + titre + infos */}
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-7xl px-4 pb-6 md:px-6">
            <div className="flex items-end gap-4 sm:gap-6">
              <div className="rounded-card bg-surface-2 ring-border relative aspect-[2/3] w-28 shrink-0 overflow-hidden shadow-lg ring-1 sm:w-40 md:w-44">
                {poster ? (
                  <Image
                    src={poster}
                    alt={`Affiche de ${title}`}
                    fill
                    sizes="(max-width: 640px) 112px, 176px"
                    className="object-cover"
                  />
                ) : (
                  <PosterPlaceholder />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h1 className="font-display text-2xl font-bold drop-shadow-sm sm:text-3xl md:text-4xl">
                  {title}
                </h1>
                {tagline && (
                  <p className="text-muted mt-1 hidden italic sm:block">
                    « {tagline} »
                  </p>
                )}
                <div className="text-muted mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm md:mt-3">
                  {rating > 0 && <RatingRing vote={rating} />}
                  {year && <span>{year}</span>}
                  {metaLine && <span>{metaLine}</span>}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
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
