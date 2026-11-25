"use client";

import { useEffect } from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import "./globals.css";

interface GlobalErrorProps {
  error: unknown;
  retry: () => void;
}

/**
 * Filet de sécurité pour les erreurs du layout racine : remplace tout le
 * document, d'où ses propres <html>/<body> et l'import des styles globaux.
 * Le thème clair est réappliqué à la main (le script du layout n'est pas là).
 */
export default function GlobalError({ error, retry }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
    try {
      if (localStorage.getItem(THEME_STORAGE_KEY) === "light") {
        document.documentElement.classList.add("light");
      }
    } catch {
      // Stockage indisponible : on garde le thème sombre par défaut.
    }
  }, [error]);

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="bg-background text-foreground flex min-h-screen items-center justify-center px-4 font-sans antialiased">
        <title>Erreur | Moovy</title>
        <section className="text-center">
          <h1 className="text-2xl font-bold md:text-3xl">
            Moovy a rencontré un problème
          </h1>
          <p className="text-danger mt-2">
            L&apos;application n&apos;a pas pu se charger. Réessayez dans un
            instant.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={retry}
              className="bg-primary hover:bg-primary/90 focus-visible:ring-primary rounded-lg px-5 py-2.5 font-medium text-white focus-visible:ring-2 focus-visible:outline-none"
            >
              Réessayer
            </button>
            {/* Lien natif : le routeur client peut être celui qui a planté. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="border-border bg-surface-2 hover:bg-surface focus-visible:ring-primary rounded-lg border px-5 py-2.5 font-medium focus-visible:ring-2 focus-visible:outline-none"
            >
              Retour à l&apos;accueil
            </a>
          </div>
        </section>
      </body>
    </html>
  );
}
