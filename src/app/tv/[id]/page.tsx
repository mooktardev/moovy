import { Suspense } from "react";
import type { Metadata } from "next";

import { formatRuntime, formatYear } from "@/lib/format";
import { getMediaReviews, getTvDetails } from "@/lib/tmdb";
import { tmdbImage } from "@/lib/images";
import { detailMetadata, loadOrNotFound } from "@/lib/tmdb-errors";
import { metaDescription, pageMetadata, tvJsonLd, siteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { DetailsSkeleton } from "@/components/DetailsSkeleton";
import { MediaDetails } from "@/components/MediaDetails";

export async function generateMetadata(
  props: PageProps<"/tv/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  return detailMetadata(
    id,
    getTvDetails,
    (show) =>
      pageMetadata({
        title: show.name,
        description: metaDescription(
          show.overview,
          `${show.name} : saisons, casting, bande-annonce et où regarder la série.`,
        ),
        path: `/tv/${show.id}`,
        type: "video.tv_show",
      }),
    "Série introuvable",
  );
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

  const show = await loadOrNotFound(id, getTvDetails);
  // Échec non bloquant : la fiche reste valable sans critiques.
  const reviews = await getMediaReviews("tv", show.id).catch(() => []);

  const trailer = show.videos?.results?.find(
    (video) => video.site === "YouTube" && video.type === "Trailer",
  );
  const seasons = show.number_of_seasons;
  const episodes = show.number_of_episodes;
  const metaLine = [
    seasons > 0 ? `${seasons} saison${seasons > 1 ? "s" : ""}` : null,
    episodes > 0 ? `${episodes} épisodes` : null,
    show.episode_run_time?.[0] ? formatRuntime(show.episode_run_time[0]) : null,
    show.genres.map((genre) => genre.name).join(", "),
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <>
      <JsonLd data={tvJsonLd(show, siteUrl())} />
      <MediaDetails
        title={show.name}
        tagline={show.tagline}
        overview={show.overview}
        backdrop={tmdbImage(show.backdrop_path, "w1280")}
        poster={tmdbImage(show.poster_path, "w342")}
        year={formatYear(show.first_air_date)}
        rating={show.vote_average}
        metaLine={metaLine || null}
        trailerKey={trailer?.key ?? null}
        cast={show.credits?.cast?.slice(0, 12) ?? []}
        similar={show.similar?.results ?? []}
        similarKind="tv"
        reviews={reviews}
        media={show}
        providers={show["watch/providers"]?.results}
      />
    </>
  );
}
