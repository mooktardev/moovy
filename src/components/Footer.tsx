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
      className="hover:text-foreground focus-visible:ring-primary inline-block rounded font-medium underline-offset-2 transition duration-200 ease-out hover:underline focus-visible:ring-2 focus-visible:outline-none"
    >
      {children}
    </a>
  );
}

/**
 * Pied de page : marque + navigation, puis barre de bas de page avec
 * copyright à gauche et crédit TMDB (lien themoviedb.org) à droite.
 */
export function Footer() {
  return (
    <footer className="border-border border-t">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        {/* Bande principale : marque + navigation */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-lg font-bold tracking-tight">
              Moovy
            </p>
            <p className="text-muted mt-1 text-sm">
              Votre escale cinéma : tendances, fiches détaillées et favoris.
            </p>
          </div>
          <nav aria-label="Pied de page">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
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
        </div>

        {/* Barre de bas de page */}
        <div className="border-border mt-6 flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Année figée : `new Date()` est une valeur instable au prerender. */}
          <p className="text-muted text-xs">© Moovy - 2026. build by Mooktar</p>
          <ExternalLink href="https://www.themoviedb.org/">
            <span className="text-muted text-xs">Crédit TMDB</span>
          </ExternalLink>
        </div>
      </div>
    </footer>
  );
}
