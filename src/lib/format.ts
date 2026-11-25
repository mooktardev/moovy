/** Année d'une date TMDB (AAAA-MM-JJ), ex. « 2024 ». */
export function formatYear(date: string | null | undefined): string | null {
  return date ? date.slice(0, 4) : null;
}

/** Date ISO (AAAA-MM-JJ) au format français long, ex. « 12 mars 1963 ». */
export function formatDateFr(date: string | null | undefined): string | null {
  if (!date) return null;
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Note sur 10 avec une décimale et virgule française, ex. « 8,0 ». */
export function formatRating(vote: number): string {
  return vote.toFixed(1).replace(".", ",");
}

/** Durée en minutes au format français, ex. « 2 h 15 ». */
export function formatRuntime(
  minutes: number | null | undefined,
): string | null {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0
    ? `${hours} h`
    : `${hours} h ${String(rest).padStart(2, "0")}`;
}

/**
 * Âge révolu en années entre une date de naissance et `end`
 * (date de décès, ou aujourd'hui pour une personne vivante).
 */
export function ageInYears(birthday: string, end: Date): number {
  const start = new Date(`${birthday}T00:00:00`);
  let age = end.getFullYear() - start.getFullYear();
  const beforeBirthday =
    end.getMonth() < start.getMonth() ||
    (end.getMonth() === start.getMonth() && end.getDate() < start.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}
