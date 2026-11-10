import type { MediaKind, MediaItem } from "@/types/tmdb";
import { mediaKind } from "@/lib/tmdb";
import { MovieCard } from "@/components/MovieCard";

interface MediaRailProps {
  title: string;
  items: MediaItem[];
  kind?: MediaKind;
}

/** Carrousel horizontal de cartes média, titré en h2 — guide de style §3 et §4. */
export function MediaRail({ title, items, kind = "movie" }: MediaRailProps) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 md:px-6">
      <h2 className="font-display text-xl font-semibold md:text-2xl">
        {title}
      </h2>
      <ul className="mt-4 flex gap-4 overflow-x-auto pb-2">
        {items.map((item) => (
          <li key={item.id} className="w-40 shrink-0 sm:w-44">
            <MovieCard item={item} kind={mediaKind(item, kind)} />
          </li>
        ))}
      </ul>
    </section>
  );
}
