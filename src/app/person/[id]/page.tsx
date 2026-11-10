import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { formatDateFr, formatYear } from "@/lib/format";
import { getPersonDetails } from "@/lib/tmdb";
import { tmdbImage } from "@/lib/images";
import { AgeSpan } from "@/components/AgeSpan";
import { PosterPlaceholder } from "@/components/PosterPlaceholder";
import type { PersonCredit } from "@/types/tmdb";

export async function generateMetadata(
  props: PageProps<"/person/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  try {
    const person = await getPersonDetails(Number(id));
    return { title: person.name };
  } catch {
    return { title: "Personne introuvable" };
  }
}

export default async function PersonPage(props: PageProps<"/person/[id]">) {
  return (
    <Suspense fallback={<PersonSkeleton />}>
      <PersonContent params={props.params} />
    </Suspense>
  );
}

/** Charge les données puis rend la fiche ; enveloppé par Suspense. */
async function PersonContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let person;
  try {
    person = await getPersonDetails(Number(id));
  } catch {
    notFound();
  }

  const profile = tmdbImage(person.profile_path, "w185");
  // Filmographie : crédits d'acteur, dédoublonnés, du plus récent au plus ancien.
  const seen = new Set<number>();
  const filmography = (person.combined_credits?.cast ?? [])
    .filter((credit) => {
      if (seen.has(credit.id)) return false;
      seen.add(credit.id);
      return true;
    })
    .sort((a, b) => (creditDate(b) ?? "").localeCompare(creditDate(a) ?? ""));

  const department =
    DEPARTEMENTS[person.known_for_department ?? ""] ??
    person.known_for_department;

  return (
    <article className="pb-12">
      {/* En-tête : photo + identité */}
      <section className="mx-auto max-w-7xl px-4 pt-10 md:px-6">
        <div className="flex flex-col gap-6 sm:flex-row">
          <div className="rounded-card bg-surface-2 relative aspect-[2/3] w-36 shrink-0 overflow-hidden sm:w-44">
            {profile ? (
              <Image
                src={profile}
                alt={`Photo de ${person.name}`}
                fill
                sizes="176px"
                className="object-cover"
                priority
              />
            ) : (
              <PosterPlaceholder />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl font-bold md:text-4xl">
              {person.name}
            </h1>
            <div className="text-muted mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              {department && (
                <span className="border-border bg-surface-2 text-foreground rounded-full border px-3 py-1">
                  {department}
                </span>
              )}
              {person.birthday && (
                <span>
                  Naissance : {formatDateFr(person.birthday)}
                  <AgeSpan
                    birthday={person.birthday}
                    deathday={person.deathday}
                  />
                </span>
              )}
              {person.deathday && (
                <span>Décès : {formatDateFr(person.deathday)}</span>
              )}
              {person.place_of_birth && <span>· {person.place_of_birth}</span>}
            </div>
          </div>
        </div>
      </section>

      {/* Biographie */}
      {person.biography && (
        <section className="mx-auto mt-10 max-w-7xl px-4 md:px-6">
          <h2 className="font-display text-xl font-semibold md:text-2xl">
            Biographie
          </h2>
          <p className="mt-3 max-w-prose leading-relaxed whitespace-pre-line">
            {person.biography}
          </p>
        </section>
      )}

      {/* Filmographie */}
      {filmography.length > 0 && (
        <section className="mx-auto mt-10 max-w-7xl px-4 md:px-6">
          <h2 className="font-display text-xl font-semibold md:text-2xl">
            Filmographie
          </h2>
          <p className="text-muted mt-1 text-sm">
            {filmography.length} titre{filmography.length > 1 ? "s" : ""}
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {filmography.map((credit) => (
              <li key={`${credit.media_type}-${credit.id}`}>
                <CreditCard credit={credit} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

/** Carte d'un titre de la filmographie, liée à sa fiche. */
function CreditCard({ credit }: { credit: PersonCredit }) {
  const poster = tmdbImage(credit.poster_path, "w185");
  const title = credit.title ?? credit.name ?? "Titre inconnu";
  const year = formatYear(creditDate(credit));

  return (
    <Link
      href={`/${credit.media_type}/${credit.id}`}
      className="group rounded-card focus-visible:ring-primary block focus-visible:ring-2 focus-visible:outline-none"
    >
      <div className="rounded-card bg-surface-2 group-focus-visible:ring-primary/60 group-hover:ring-primary/60 relative aspect-[2/3] overflow-hidden transition duration-200 ease-out group-hover:ring-2 group-focus-visible:ring-2 motion-reduce:transition-none">
        {poster ? (
          <Image
            src={poster}
            alt={`Affiche de ${title}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            className="object-cover transition-transform duration-200 ease-out group-hover:scale-105 motion-reduce:transform-none"
          />
        ) : (
          <PosterPlaceholder />
        )}
      </div>
      <h3 className="mt-2 line-clamp-2 text-sm font-medium">{title}</h3>
      <p className="text-muted line-clamp-1 text-xs">
        {[year, credit.character].filter(Boolean).join(" · ")}
      </p>
    </Link>
  );
}

/** Date TMDB d'un crédit, film ou série. */
function creditDate(credit: PersonCredit): string | null {
  return credit.release_date ?? credit.first_air_date ?? null;
}

/** Traduction des départements TMDB (renvoyés en anglais). */
const DEPARTEMENTS: Record<string, string> = {
  Acting: "Interprétation",
  Directing: "Réalisation",
  Writing: "Écriture",
  Production: "Production",
  Camera: "Image",
  Sound: "Son",
  Art: "Décors",
  Crew: "Équipe technique",
  Editing: "Montage",
  "Visual Effects": "Effets visuels",
};

function PersonSkeleton() {
  return (
    <section className="mx-auto max-w-7xl space-y-6 px-4 py-12 md:px-6">
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="rounded-card bg-surface-2 aspect-[2/3] w-36 animate-pulse sm:w-44" />
        <div className="flex-1 space-y-3">
          <div className="bg-surface-2 h-9 w-64 animate-pulse rounded-lg" />
          <div className="bg-surface-2 h-4 w-40 animate-pulse rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="bg-surface-2 rounded-card aspect-[2/3] animate-pulse"
          />
        ))}
      </div>
    </section>
  );
}
