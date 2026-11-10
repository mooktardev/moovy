"use client";

import Link from "next/link";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Page d'erreur globale : message clair en text-danger + bouton
 * « Réessayer » (guide de style §8). Le détail technique reste en console.
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Journalisation : console ici, service d'observabilité (Sentry…)
    // quand le projet en aura besoin.
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 text-center md:px-6">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-danger mx-auto size-12"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m0 3.5h.01M10.3 3.9L2.4 17.5a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"
        />
      </svg>
      <h1 className="font-display mt-4 text-2xl font-bold md:text-3xl">
        Une erreur est survenue
      </h1>
      <p className="text-danger mt-2">
        Impossible d'afficher cette page pour le moment.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="bg-primary hover:bg-primary/90 focus-visible:ring-primary inline-block rounded-lg px-5 py-2.5 font-medium text-white transition duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none"
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="border-border bg-surface-2 hover:bg-surface focus-visible:ring-primary inline-block rounded-lg border px-5 py-2.5 font-medium transition duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none"
        >
          Retour à l'accueil
        </Link>
      </div>
    </section>
  );
}
