import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { getPopularPeople } from "@/lib/tmdb";
import { tmdbImage } from "@/lib/images";
import { PosterPlaceholder } from "@/components/PosterPlaceholder";
import type { PersonSummary } from "@/types/tmdb";

export const metadata: Metadata = {
  title: "Acteurs",
};

export default async function ActeursPage() {
  const { results } = await getPopularPeople();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <h1 className="font-display text-3xl font-bold md:text-4xl">
        Acteurs populaires
      </h1>
      <p className="text-muted mt-2">
        Les visages les plus populaires du moment, d'après TMDB.
      </p>

      <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {results.map((person) => (
          <li key={person.id}>
            <PersonCard person={person} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Carte personne : portrait 2:3, nom et spécialité — guide de style §6. */
function PersonCard({ person }: { person: PersonSummary }) {
  const profile = tmdbImage(person.profile_path, "w185");

  return (
    <Link
      href={`/person/${person.id}`}
      className="group rounded-card focus-visible:ring-primary block focus-visible:ring-2 focus-visible:outline-none"
    >
      <div className="rounded-card bg-surface-2 group-focus-visible:ring-primary/60 group-hover:ring-primary/60 relative aspect-[2/3] overflow-hidden transition duration-200 ease-out group-hover:ring-2 group-focus-visible:ring-2 motion-reduce:transition-none">
        {profile ? (
          <Image
            src={profile}
            alt={`Photo de ${person.name}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            className="object-cover transition-transform duration-200 ease-out group-hover:scale-105 motion-reduce:transform-none"
          />
        ) : (
          <PosterPlaceholder />
        )}
      </div>
      <h2 className="mt-2 line-clamp-2 text-sm font-medium">{person.name}</h2>
    </Link>
  );
}
