"use client";

import { useRouter } from "next/navigation";
import type { Genre, SortOption } from "@/types/tmdb";

interface FilterBarProps {
  basePath: string;
  genres: Genre[];
  current: {
    genreId: number | null;
    year: number | null;
    sort: SortOption;
  };
}

/** Années de l'année courante à 1950, en ordre décroissant. */
function getYears(): number[] {
  const current = new Date().getFullYear();
  return Array.from({ length: current - 1949 }, (_, index) => current - index);
}

const SELECT_CLASS =
  "rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary";

/**
 * Filtres du catalogue : l'URL est la source de vérité, chaque changement
 * pousse une nouvelle URL (et réinitialise la page).
 */
export function FilterBar({ basePath, genres, current }: FilterBarProps) {
  const router = useRouter();
  const years = getYears();

  function update(changes: { genre?: string; year?: string; sort?: string }) {
    const base = {
      genre: current.genreId ? String(current.genreId) : "",
      year: current.year ? String(current.year) : "",
      sort: current.sort,
      ...changes,
    };

    const params = new URLSearchParams();
    if (base.genre) params.set("genre", base.genre);
    if (base.year) params.set("year", base.year);
    if (base.sort !== "popularity") params.set("sort", base.sort);

    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={current.genreId ?? ""}
        onChange={(event) => update({ genre: event.target.value })}
        aria-label="Filtrer par genre"
        className={SELECT_CLASS}
      >
        <option value="">Tous les genres</option>
        {genres.map((genre) => (
          <option key={genre.id} value={genre.id}>
            {genre.name}
          </option>
        ))}
      </select>

      <select
        value={current.year ?? ""}
        onChange={(event) => update({ year: event.target.value })}
        aria-label="Filtrer par année"
        className={SELECT_CLASS}
      >
        <option value="">Toutes les années</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>

      <select
        value={current.sort}
        onChange={(event) => update({ sort: event.target.value })}
        aria-label="Trier par"
        className={SELECT_CLASS}
      >
        <option value="popularity">Populaires</option>
        <option value="rating">Mieux notés</option>
        <option value="newest">Plus récents</option>
      </select>
    </div>
  );
}
