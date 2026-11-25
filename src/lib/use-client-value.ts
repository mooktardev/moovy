import { useSyncExternalStore } from "react";

/** Abonnement vide : la valeur ne change pas après le montage. */
const subscribeNever = () => () => {};

/**
 * Valeur calculée uniquement côté navigateur (horloge, `window`…).
 * Le serveur et l'hydratation rendent `serverValue`, puis React re-rend
 * avec `getValue()` : pas de mismatch, et pas de setState dans un effet.
 * `getValue` doit renvoyer une valeur stable (primitive ou mémoïsée).
 */
export function useClientValue<T, S>(getValue: () => T, serverValue: S): T | S {
  return useSyncExternalStore<T | S>(
    subscribeNever,
    getValue,
    () => serverValue,
  );
}

/** Faux pendant le rendu serveur et l'hydratation, vrai ensuite. */
export function useHydrated(): boolean {
  return useClientValue(() => true, false);
}
