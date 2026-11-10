import Link from "next/link";

/**
 * Page 404 personnalisée : sert aussi aux appels `notFound()` des fiches
 * (film, série, personne introuvables). Icône + phrase + actions — §8.
 */
export default function NotFound() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 text-center md:px-6">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-muted mx-auto size-12"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 4.5A1.5 1.5 0 015.5 3h13A1.5 1.5 0 0120 4.5v15a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 19.5v-15zM4 8h16M8 3v5M16 3v5M7.5 12.5l2 2 3.5-4 3.5 4.5"
        />
      </svg>
      <h1 className="font-display mt-4 text-3xl font-bold md:text-4xl">
        Cette page a disparu du montage final
      </h1>
      <p className="text-muted mt-2">
        La page que vous cherchez n'existe pas ou n'existe plus.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="bg-primary hover:bg-primary/90 focus-visible:ring-primary inline-block rounded-lg px-5 py-2.5 font-medium text-white transition duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none"
        >
          Retour à l'accueil
        </Link>
        <Link
          href="/films"
          className="border-border bg-surface-2 hover:bg-surface focus-visible:ring-primary inline-block rounded-lg border px-5 py-2.5 font-medium transition duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none"
        >
          Explorer les films
        </Link>
      </div>
    </section>
  );
}
