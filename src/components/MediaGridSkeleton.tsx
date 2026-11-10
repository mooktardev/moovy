/** Squelette de grille de résultats, aux dimensions des cartes — guide de style §8. */
export function MediaGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <ul
      aria-busy="true"
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
    >
      {Array.from({ length: count }, (_, index) => (
        <li
          key={index}
          className="rounded-card bg-surface-2 aspect-[2/3] animate-pulse"
        />
      ))}
    </ul>
  );
}
