import { MediaGridSkeleton } from "@/components/MediaGridSkeleton";

/** Squelette du catalogue, aux dimensions du contenu final — guide de style §8. */
export function CatalogueSkeleton() {
  return (
    <section
      aria-busy="true"
      className="mx-auto max-w-7xl space-y-6 px-4 py-12 md:px-6"
    >
      <div className="bg-surface-2 h-9 w-40 animate-pulse rounded-lg" />
      <div className="flex gap-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="bg-surface-2 h-10 w-40 animate-pulse rounded-lg"
          />
        ))}
      </div>
      <MediaGridSkeleton />
    </section>
  );
}
