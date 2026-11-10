import type { MediaItem, MediaKind } from "@/types/tmdb";
import { mediaKind } from "@/lib/tmdb";
import { MovieCard } from "@/components/MovieCard";

/** Grille d'affiches responsive — guide de style §4. */
export function MediaGrid({
  items,
  kind,
}: {
  items: MediaItem[];
  kind: MediaKind;
}) {
  if (items.length === 0) {
    return <p className="text-muted">Aucun média à afficher pour le moment.</p>;
  }

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {items.map((item) => (
        <li key={item.id}>
          <MovieCard item={item} kind={mediaKind(item, kind)} />
        </li>
      ))}
    </ul>
  );
}
