import { OG_CONTENT_TYPE, OG_SIZE, brandImage } from "@/lib/og";

export const alt =
  "Moovy — films et séries : tendances, fiches et bandes-annonces";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Image de partage par défaut (accueil, catalogues, pages sans image). */
export default function Image() {
  return brandImage();
}
