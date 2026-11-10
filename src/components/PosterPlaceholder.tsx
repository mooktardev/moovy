/** Affiche manquante : fond surface-2 + icône film — guide de style §7. */
export function PosterPlaceholder() {
  return (
    <div className="flex h-full items-center justify-center">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-muted size-10"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 4.5A1.5 1.5 0 015.5 3h13A1.5 1.5 0 0120 4.5v15a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 19.5v-15zM4 8h16M8 3v5M16 3v5"
        />
      </svg>
    </div>
  );
}
