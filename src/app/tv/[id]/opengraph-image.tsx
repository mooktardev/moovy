import { formatYear } from "@/lib/format";
import { tmdbImage } from "@/lib/images";
import { OG_CONTENT_TYPE, OG_SIZE, detailImage } from "@/lib/og";
import { getTvDetails } from "@/lib/tmdb";

export const alt = "Affiche et note de la série sur Moovy";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  return detailImage(id, getTvDetails, (show) => {
    const seasons = show.number_of_seasons;
    return {
      title: show.name,
      subtitle: [
        formatYear(show.first_air_date),
        seasons > 0 ? `${seasons} saison${seasons > 1 ? "s" : ""}` : null,
        show.genres[0]?.name,
      ]
        .filter(Boolean)
        .join(" • "),
      rating: show.vote_count ? show.vote_average : null,
      poster: tmdbImage(show.poster_path, "w342"),
      backdrop: tmdbImage(show.backdrop_path, "w1280"),
    };
  });
}
