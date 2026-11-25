import { formatYear } from "@/lib/format";
import { tmdbImage } from "@/lib/images";
import { OG_CONTENT_TYPE, OG_SIZE, detailImage } from "@/lib/og";
import { getMovieDetails } from "@/lib/tmdb";

export const alt = "Affiche et note du film sur Moovy";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  return detailImage(id, getMovieDetails, (movie) => ({
    title: movie.title,
    subtitle: [
      formatYear(movie.release_date),
      movie.genres
        .slice(0, 2)
        .map((genre) => genre.name)
        .join(", "),
    ]
      .filter(Boolean)
      .join(" • "),
    rating: movie.vote_count ? movie.vote_average : null,
    poster: tmdbImage(movie.poster_path, "w342"),
    backdrop: tmdbImage(movie.backdrop_path, "w1280"),
  }));
}
