import { formatRating } from "@/lib/format";

/** Note sur 10 au format français, étoile dorée — guide de style §6. */
export function RatingBadge({ vote }: { vote: number }) {
  return (
    <span className="text-rating inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-3"
      >
        <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.5L12 17.3l-5.9 3.2 1.3-6.5L2.5 9.4l6.6-.8L12 2.5z" />
      </svg>
      {formatRating(vote)}
    </span>
  );
}
