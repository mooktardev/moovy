"use client";

import { useEffect, useState } from "react";

interface AgeSpanProps {
  /** Date de naissance (AAAA-MM-JJ). */
  birthday: string;
  /** Date de décès éventuelle (AAAA-MM-JJ) : l'âge devient celui vécu. */
  deathday: string | null;
}

/**
 * Âge en années, calculé côté client uniquement : `new Date()` est une
 * valeur instable que le prerender refuse (blocking-prerender-current-time).
 * Rien n'est rendu avant le montage — zéro mismatch d'hydratation.
 */
export function AgeSpan({ birthday, deathday }: AgeSpanProps) {
  const [age, setAge] = useState<number | null>(null);

  useEffect(() => {
    const start = new Date(`${birthday}T00:00:00`);
    const end = deathday ? new Date(`${deathday}T00:00:00`) : new Date();
    let value = end.getFullYear() - start.getFullYear();
    const beforeBirthday =
      end.getMonth() < start.getMonth() ||
      (end.getMonth() === start.getMonth() && end.getDate() < start.getDate());
    if (beforeBirthday) value -= 1;
    setAge(value);
  }, [birthday, deathday]);

  if (age === null) return null;
  return <> ({age} ans)</>;
}
