import { discoverMovies, discoverTv, getGenres } from "@/lib/tmdb";
import { safe } from "@/lib/safe";
import type { SortOption } from "@/types/tmdb";
import { FilterBar } from "@/components/FilterBar";
import { MediaGrid } from "@/components/MediaGrid";
import { Pagination } from "@/components/Pagination";

type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

interface CatalogueContentProps {
  title: string;
  kind: "movie" | "tv";
  searchParams: SearchParams;
}

function toInt(value: string | string[] | undefined): number | null {
  const str = Array.isArray(value) ? value[0] : value;
  if (!str) return null;
  const parsed = Number.parseInt(str, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function toSort(value: string | string[] | undefined): SortOption {
  return value === "rating" || value === "newest" ? value : "popularity";
}

/** TMDB limite le nombre de pages navigables à 500. */
const MAX_PAGES = 500;

/**
 * Contenu du catalogue (films ou séries) : filtres depuis l'URL,
 * grille et pagination. Accède à searchParams : vit sous Suspense.
 */
export async function CatalogueContent({
  title,
  kind,
  searchParams,
}: CatalogueContentProps) {
  const sp = await searchParams;
  const genreId = toInt(sp.genre);
  const year = toInt(sp.year);
  const sort = toSort(sp.sort);
  const page = Math.max(1, toInt(sp.page) ?? 1);
  const basePath = kind === "tv" ? "/series" : "/films";

  const [data, genres] = await Promise.all([
    safe(
      kind === "tv"
        ? discoverTv({ page, genreId, year, sort })
        : discoverMovies({ page, genreId, year, sort }),
    ),
    safe(getGenres(kind)),
  ]);

  const totalPages = Math.min(data?.total_pages ?? 0, MAX_PAGES);

  function hrefFor(targetPage: number): string {
    const params = new URLSearchParams();
    if (genreId) params.set("genre", String(genreId));
    if (year) params.set("year", String(year));
    if (sort !== "popularity") params.set("sort", sort);
    if (targetPage > 1) params.set("page", String(targetPage));
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-12 md:px-6">
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-bold md:text-4xl">{title}</h1>
        {genres && genres.length > 0 && (
          <FilterBar
            basePath={basePath}
            genres={genres}
            current={{ genreId, year, sort }}
          />
        )}
      </div>

      {data ? (
        data.results.length > 0 ? (
          <>
            <MediaGrid items={data.results} kind={kind} />
            {totalPages > 1 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                hrefFor={hrefFor}
              />
            )}
          </>
        ) : (
          <p className="text-muted">
            Aucun résultat pour ces filtres. Essayez d&apos;élargir votre
            recherche.
          </p>
        )
      ) : (
        <p className="text-danger">
          Impossible de charger les {title.toLowerCase()} pour le moment.
        </p>
      )}
    </section>
  );
}
