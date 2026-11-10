"use client";

import { useWatchlist } from "@/components/WatchlistProvider";
import type { WatchlistItem } from "@/lib/watchlist";

interface WatchlistButtonProps {
  item: WatchlistItem;
  /** overlay : rond posé sur l'affiche ; inline : bouton texte de fiche. */
  variant?: "overlay" | "inline";
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5"
    >
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 10-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

/**
 * Bouton favori : cœur vide → plein + text-primary quand actif
 * (la couleur ne porte jamais seule l'information — guide de style §9).
 */
export function WatchlistButton({
  item,
  variant = "overlay",
}: WatchlistButtonProps) {
  const { has, toggle, hydrated } = useWatchlist();
  const active = hydrated && has(item.kind, item.id);
  const label = active
    ? `Retirer « ${item.title} » de ma liste`
    : `Ajouter « ${item.title} » à ma liste`;

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={() => toggle(item)}
        aria-pressed={active}
        aria-label={label}
        title={label}
        className={`focus-visible:ring-primary inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 font-medium transition duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none ${
          active
            ? "border-primary/60 bg-primary/10 text-primary"
            : "border-border bg-surface-2 text-foreground hover:bg-surface"
        }`}
      >
        <HeartIcon filled={active} />
        {active ? "Dans ma liste" : "Ajouter à ma liste"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(item)}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={`focus-visible:ring-primary flex size-10 items-center justify-center rounded-full bg-black/50 backdrop-blur transition duration-200 ease-out hover:bg-black/70 focus-visible:ring-2 focus-visible:outline-none ${
        active ? "text-primary" : "text-foreground"
      }`}
    >
      <HeartIcon filled={active} />
    </button>
  );
}
