import Image from "next/image";
import Link from "next/link";

import { tmdbImage } from "@/lib/tmdb";
import { MediaRail } from "@/components/MediaRail";
import { RatingBadge } from "@/components/RatingBadge";
import type { CastMember, MediaItem, MediaKind } from "@/types/tmdb";

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
}: MediaDetailsProps) {
  return (
    <article className="pb-12">
      {/* Bandeau backdrop */}
      <div className="relative h-[40vh] max-h-[480px] min-h-[280px]">
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

      {/* En-tête : affiche + infos */}
      <div className="mx-auto -mt-28 max-w-7xl px-4 md:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
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
              <div className="flex h-full items-center justify-center">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-muted size-10"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4.5A1.5 1.5 0 015.5 3h13A1.5 1.5 0 0120 4.5v15a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 19.5v-15zM4 8h16M8 3v5M16 3v5"
                  />
                </svg>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl font-bold md:text-4xl">
              {title}
            </h1>
            {tagline && <p className="text-muted mt-1 italic">« {tagline} »</p>}
            <div className="text-muted mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
              {year && <span>{year}</span>}
              <RatingBadge vote={rating} />
              {metaLine && <span>{metaLine}</span>}
            </div>
            {trailerUrl && (
              <Link
                href={trailerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary hover:bg-primary/90 focus-visible:ring-primary mt-5 inline-block rounded-lg px-5 py-2.5 font-medium text-white transition duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none"
              >
                Bande-annonce
              </Link>
            )}
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
          <ul className="mt-4 flex gap-4 overflow-x-auto pb-2">
            {cast.map((member) => {
              const profile = tmdbImage(member.profile_path, "w185");
              return (
                <li key={member.id} className="w-28 shrink-0">
                  <div className="rounded-card bg-surface-2 relative aspect-[2/3] overflow-hidden">
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
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Recommandations */}
      {similar.length > 0 && (
        <div className="mt-10">
          <MediaRail title="Similaires" items={similar} kind={similarKind} />
        </div>
      )}
    </article>
  );
}
