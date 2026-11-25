/**
 * Squelette de fiche détaillée, calqué sur MediaDetails (hero à 50vh,
 * affiche et titre superposés en bas, synopsis). Au moins un écran de
 * haut : le pied de page reste sous la ligne de flottaison pendant le
 * chargement, et ne saute pas à l'arrivée du contenu (CLS).
 */
export function DetailsSkeleton() {
  return (
    <div aria-busy="true" className="min-h-screen animate-pulse pb-12">
      <div className="bg-surface-2 relative h-[50vh] max-h-[640px] min-h-[320px]">
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-7xl px-4 pb-6 md:px-6">
            <div className="flex items-end gap-4 sm:gap-6">
              <div className="rounded-card bg-surface aspect-[2/3] w-28 shrink-0 sm:w-40 md:w-44" />
              <div className="flex-1 space-y-3">
                <div className="bg-surface h-8 w-2/3 rounded-lg" />
                <div className="bg-surface h-4 w-1/3 rounded" />
                <div className="bg-surface h-10 w-44 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl space-y-3 px-4 pt-10 md:px-6">
        <div className="bg-surface-2 h-6 w-32 rounded-lg" />
        <div className="bg-surface-2 h-4 w-full max-w-3xl rounded" />
        <div className="bg-surface-2 h-4 w-full max-w-2xl rounded" />
        <div className="bg-surface-2 h-4 w-2/3 max-w-xl rounded" />
      </div>
    </div>
  );
}
