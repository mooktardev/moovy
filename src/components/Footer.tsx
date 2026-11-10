import Link from "next/link";

import { LINKS } from "@/lib/links";

/** Lien externe discret avec anneau de focus — guide de style §8/§9. */
function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-foreground focus-visible:ring-primary inline-block rounded px-0.5 font-medium underline-offset-2 transition duration-200 ease-out hover:underline focus-visible:ring-2 focus-visible:outline-none"
    >
      {children}
    </a>
  );
}

/**
 * Pied de page : navigation, crédits des données (attribution TMDB
 * obligatoire + JustWatch pour les offres de streaming) et copyright.
 */
export function Footer() {
  return (
    <footer className="border-border border-t">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Marque */}
          <div>
            <p className="font-display text-lg font-bold tracking-tight">
              Moovy
            </p>
            <p className="text-muted mt-2 max-w-xs text-sm">
              Tendances, fiches détaillées et favoris — votre escale cinéma.
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Pied de page">
            <p className="text-foreground text-sm font-semibold">Navigation</p>
            <ul className="mt-3 space-y-1">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted hover:text-foreground focus-visible:ring-primary inline-block px-0.5 py-1 text-sm transition duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Données et crédits */}
          <div>
            <p className="text-foreground text-sm font-semibold">
              Données &amp; crédits
            </p>
            <p className="text-muted mt-3 text-xs leading-relaxed">
              Ce produit utilise l&apos;API{" "}
              <ExternalLink href="https://www.themoviedb.org/">
                TMDB
              </ExternalLink>{" "}
              mais n&apos;est pas approuvé ni certifié par TMDB.
            </p>
            <p className="text-muted mt-2 text-xs leading-relaxed">
              Offres de streaming fournies par{" "}
              <ExternalLink href="https://www.justwatch.com/">
                JustWatch
              </ExternalLink>
              .
            </p>
          </div>
        </div>

        {/* Bas de page */}
        <div className="border-border mt-8 border-t pt-4">
          {/* Année figée : `new Date()` est une valeur instable au prerender. */}
          <p className="text-muted text-xs">
            © 2026 Moovy — projet de portfolio. Toutes les données
            cinématographiques proviennent de TMDB.
          </p>
        </div>
      </div>
    </footer>
  );
}
