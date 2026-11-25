import { departmentLabel, formatYear } from "@/lib/format";
import { tmdbImage } from "@/lib/images";
import { OG_CONTENT_TYPE, OG_SIZE, detailImage } from "@/lib/og";
import { getPersonDetails } from "@/lib/tmdb";

export const alt = "Portrait et filmographie sur Moovy";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  return detailImage(id, getPersonDetails, (person) => {
    const born = formatYear(person.birthday);
    const died = formatYear(person.deathday);
    return {
      title: person.name,
      subtitle: [
        departmentLabel(person.known_for_department),
        born ? (died ? `${born} – ${died}` : `Naissance : ${born}`) : null,
      ]
        .filter(Boolean)
        .join(" • "),
      rating: null,
      poster: tmdbImage(person.profile_path, "w342"),
      backdrop: null,
    };
  });
}
