"use client";

import { ageInYears } from "@/lib/format";
import { useClientValue } from "@/lib/use-client-value";

interface AgeSpanProps {
  /** Date de naissance (AAAA-MM-JJ). */
  birthday: string;
  /** Date de décès éventuelle (AAAA-MM-JJ) : l'âge devient celui vécu. */
  deathday: string | null;
}

/**
 * Âge en années, calculé côté client uniquement : `new Date()` est une
 * valeur instable que le prerender refuse (blocking-prerender-current-time).
 * Rien n'est rendu au prerender ni à l'hydratation — zéro mismatch.
 */
export function AgeSpan({ birthday, deathday }: AgeSpanProps) {
  const age = useClientValue(
    () =>
      ageInYears(
        birthday,
        deathday ? new Date(`${deathday}T00:00:00`) : new Date(),
      ),
    null,
  );

  if (age === null) return null;
  return <> ({age} ans)</>;
}
