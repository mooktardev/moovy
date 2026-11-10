/** Année d'une date TMDB (AAAA-MM-JJ), ex. « 2024 ». */
export function formatYear(date: string | null | undefined): string | null {
  return date ? date.slice(0, 4) : null;
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
