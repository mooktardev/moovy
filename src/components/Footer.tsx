import Link from "next/link";

/**
 * Mention d'attribution TMDB obligatoire :
 * « Ce produit utilise l'API TMDB mais n'est pas approuvé ni certifié par TMDB. »
 * https://www.themoviedb.org/documentation/api/terms-of-use
 */
export function Footer() {
  return (
    <footer className="border-border border-t py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 text-center md:px-6">
        <Link
          href="https://www.themoviedb.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-display text-foreground hover:text-primary focus-visible:ring-primary text-sm font-semibold transition duration-200 ease-out focus-visible:ring-2"
        >
          TMDB
        </Link>
        <p className="text-muted text-xs">
          Ce produit utilise l&apos;API TMDB mais n&apos;est pas approuvé ni
          certifié par TMDB.
        </p>
        <p className="text-muted text-xs">
          Moovy — projet de portfolio. Les données cinématographiques
          proviennent de The Movie Database.
        </p>
      </div>
    </footer>
  );
}
