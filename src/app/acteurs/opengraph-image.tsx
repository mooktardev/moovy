import { OG_CONTENT_TYPE, OG_SIZE, brandImage } from "@/lib/og";

export const alt = "Acteurs populaires sur Moovy";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** La page définit son propre openGraph : l'image racine n'est pas héritée. */
export default function Image() {
  return brandImage({
    title: "Acteurs",
    subtitle:
      "Les visages les plus populaires du moment, biographies et filmographies.",
  });
}
