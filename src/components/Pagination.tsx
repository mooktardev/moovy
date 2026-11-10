import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  /** Construit l'href d'une page en conservant les filtres actifs. */
  hrefFor: (page: number) => string;
}

/** Pages affichées : extrémités + fenêtre autour de la page courante. */
function pageList(page: number, totalPages: number): (number | "…")[] {
  const candidates = new Set(
    [1, totalPages, page - 1, page, page + 1].filter(
      (p) => p >= 1 && p <= totalPages,
    ),
  );
  const sorted = [...candidates].sort((a, b) => a - b);
  const output: (number | "…")[] = [];
  let previous = 0;
  for (const p of sorted) {
    if (p - previous > 1) output.push("…");
    output.push(p);
    previous = p;
  }
  return output;
}

const BUTTON_CLASS =
  "rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm text-foreground transition duration-200 ease-out hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
const DISABLED_CLASS = `${BUTTON_CLASS} pointer-events-none opacity-40`;
const ACTIVE_CLASS =
  "rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white";

/** Pagination à liens réels (indexable), fenêtre ±2 avec extrémités. */
export function Pagination({ page, totalPages, hrefFor }: PaginationProps) {
  const previous = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-center gap-2 pt-4"
    >
      {previous ? (
        <Link href={hrefFor(previous)} className={BUTTON_CLASS}>
          Précédent
        </Link>
      ) : (
        <span aria-hidden="true" className={DISABLED_CLASS}>
          Précédent
        </span>
      )}

      {pageList(page, totalPages).map((entry, index) =>
        entry === "…" ? (
          <span key={`ellipsis-${index}`} className="text-muted px-1">
            …
          </span>
        ) : entry === page ? (
          <span key={entry} aria-current="page" className={ACTIVE_CLASS}>
            {entry}
          </span>
        ) : (
          <Link key={entry} href={hrefFor(entry)} className={BUTTON_CLASS}>
            {entry}
          </Link>
        ),
      )}

      {next ? (
        <Link href={hrefFor(next)} className={BUTTON_CLASS}>
          Suivant
        </Link>
      ) : (
        <span aria-hidden="true" className={DISABLED_CLASS}>
          Suivant
        </span>
      )}
    </nav>
  );
}
