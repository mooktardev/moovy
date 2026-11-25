import { OG_CONTENT_TYPE, OG_SIZE, brandImage } from "@/lib/og";

export const alt = "Catalogue de séries sur Moovy";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** La page définit son propre openGraph : l'image racine n'est pas héritée. */
export default function Image() {
  return brandImage({
    title: "Séries",
    subtitle: "Le catalogue de séries par genre, année, popularité ou note.",
  });
}
