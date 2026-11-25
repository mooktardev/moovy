import { Suspense } from "react";
import type { Metadata } from "next";

import { formatRuntime, formatYear } from "@/lib/format";
import { getMediaReviews, getMovieDetails } from "@/lib/tmdb";
import { tmdbImage } from "@/lib/images";
import { loadOrNotFound, metadataTitle } from "@/lib/tmdb-errors";
import { DetailsSkeleton } from "@/components/DetailsSkeleton";
import { MediaDetails } from "@/components/MediaDetails";

export async function generateMetadata(
  props: PageProps<"/movie/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  return metadataTitle(
    id,
    getMovieDetails,
    (movie) => movie.title,
    "Film introuvable",
  );
}

export default async function MoviePage(props: PageProps<"/movie/[id]">) {
  return (
    <Suspense fallback={<DetailsSkeleton />}>
      <MovieContent params={props.params} />
    </Suspense>
  );
}

/** Charge les données puis rend la fiche ; enveloppé par Suspense. */
async function MovieContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const movie = await loadOrNotFound(id, getMovieDetails);
  // Échec non bloquant : la fiche reste valable sans critiques.
  const reviews = await getMediaReviews("movie", movie.id).catch(() => []);

  const trailer = movie.videos?.results?.find(
    (video) => video.site === "YouTube" && video.type === "Trailer",
  );
  const metaLine = [
    formatRuntime(movie.runtime),
    movie.genres.map((genre) => genre.name).join(", "),
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <MediaDetails
      title={movie.title}
      tagline={movie.tagline}
      overview={movie.overview}
      backdrop={tmdbImage(movie.backdrop_path, "w1280")}
      poster={tmdbImage(movie.poster_path, "w342")}
      year={formatYear(movie.release_date)}
      rating={movie.vote_average}
      metaLine={metaLine || null}
      trailerKey={trailer?.key ?? null}
      cast={movie.credits?.cast?.slice(0, 12) ?? []}
      similar={movie.similar?.results ?? []}
      similarKind="movie"
      reviews={reviews}
      media={movie}
      providers={movie["watch/providers"]?.results}
    />
  );
}
