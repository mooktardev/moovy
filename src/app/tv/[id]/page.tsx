import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { formatRuntime, formatYear } from "@/lib/format";
import { getTvDetails, tmdbImage } from "@/lib/tmdb";
import { DetailsSkeleton } from "@/components/DetailsSkeleton";
import { MediaDetails } from "@/components/MediaDetails";

export async function generateMetadata(
  props: PageProps<"/tv/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  try {
    const show = await getTvDetails(Number(id));
    return { title: show.name };
  } catch {
    return { title: "Série introuvable" };
  }
}

export default async function TvPage(props: PageProps<"/tv/[id]">) {
  return (
    <Suspense fallback={<DetailsSkeleton />}>
      <TvContent params={props.params} />
    </Suspense>
  );
}

/** Charge les données puis rend la fiche ; enveloppé par Suspense. */
async function TvContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let show;
  try {
    show = await getTvDetails(Number(id));
  } catch {
    notFound();
  }

  const trailer = show.videos?.results?.find(
    (video) => video.site === "YouTube" && video.type === "Trailer",
  );
  const seasons = show.number_of_seasons;
  const episodes = show.number_of_episodes;
  const metaLine = [
    formatYear(show.first_air_date),
    seasons > 0 ? `${seasons} saison${seasons > 1 ? "s" : ""}` : null,
    episodes > 0 ? `${episodes} épisodes` : null,
    show.episode_run_time?.[0] ? formatRuntime(show.episode_run_time[0]) : null,
    show.genres.map((genre) => genre.name).join(", "),
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <MediaDetails
      title={show.name}
      tagline={show.tagline}
      overview={show.overview}
      backdrop={tmdbImage(show.backdrop_path, "w1280")}
      poster={tmdbImage(show.poster_path, "w342")}
      year={formatYear(show.first_air_date)}
      rating={show.vote_average}
      metaLine={metaLine || null}
      trailerUrl={
        trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null
      }
      cast={show.credits?.cast?.slice(0, 12) ?? []}
      similar={show.similar?.results ?? []}
      similarKind="tv"
    />
  );
}
