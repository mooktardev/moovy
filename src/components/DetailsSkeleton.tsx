/** Squelette de fiche détaillée, aux dimensions du contenu final — guide de style §8. */
export function DetailsSkeleton() {
  return (
    <div aria-busy="true" className="animate-pulse pb-12">
      <div className="bg-surface-2 h-[40vh] max-h-[480px] min-h-[280px]" />
      <div className="mx-auto -mt-28 max-w-7xl px-4 md:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
          <div className="rounded-card bg-surface-2 aspect-[2/3] w-36 shrink-0 sm:w-44" />
          <div className="flex-1 space-y-3">
            <div className="bg-surface-2 h-8 w-2/3 rounded-lg" />
            <div className="bg-surface-2 h-4 w-1/3 rounded" />
            <div className="bg-surface-2 h-4 w-1/2 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
