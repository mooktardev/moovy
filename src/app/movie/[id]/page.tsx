import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { formatRuntime, formatYear } from "@/lib/format";
import { getMovieDetails, tmdbImage } from "@/lib/tmdb";
import { DetailsSkeleton } from "@/components/DetailsSkeleton";
import { MediaDetails } from "@/components/MediaDetails";

export async function generateMetadata(
  props: PageProps<"/movie/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  try {
    const movie = await getMovieDetails(Number(id));
    return { title: movie.title };
  } catch {
    return { title: "Film introuvable" };
  }
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

  let movie;
  try {
    movie = await getMovieDetails(Number(id));
  } catch {
    notFound();
  }

  const trailer = movie.videos?.results?.find(
    (video) => video.site === "YouTube" && video.type === "Trailer",
  );
  const metaLine = [
    formatYear(movie.release_date),
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
      trailerUrl={
        trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null
      }
      cast={movie.credits?.cast?.slice(0, 12) ?? []}
      similar={movie.similar?.results ?? []}
      similarKind="movie"
    />
  );
}
