"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import {
  getWatchlistServerSnapshot,
  getWatchlistSnapshot,
  subscribeWatchlist,
  updateWatchlist,
  watchlistKey,
  type WatchlistItem,
} from "@/lib/watchlist";
import { useHydrated } from "@/lib/use-client-value";

interface WatchlistContextValue {
  items: WatchlistItem[];
  /** Vrai une fois les données localStorage chargées côté client. */
  hydrated: boolean;
  has: (kind: WatchlistItem["kind"], id: number) => boolean;
  toggle: (item: WatchlistItem) => void;
  remove: (kind: WatchlistItem["kind"], id: number) => void;
  clear: () => void;
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

function toggle(item: WatchlistItem) {
  const key = watchlistKey(item);
  updateWatchlist((items) =>
    items.some((entry) => watchlistKey(entry) === key)
      ? items.filter((entry) => watchlistKey(entry) !== key)
      : [item, ...items],
  );
}

function remove(kind: WatchlistItem["kind"], id: number) {
  const key = watchlistKey({ kind, id });
  updateWatchlist((items) =>
    items.filter((entry) => watchlistKey(entry) !== key),
  );
}

function clear() {
  updateWatchlist(() => []);
}

/**
 * Watchlist partagée par l'application. L'état vit dans un store externe
 * adossé à localStorage (`@/lib/watchlist`) : le serveur et l'hydratation
 * rendent une liste vide, puis React lit le stockage — pas de mismatch.
 * Les autres onglets sont suivis via l'événement `storage`.
 */
export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(
    subscribeWatchlist,
    getWatchlistSnapshot,
    getWatchlistServerSnapshot,
  );
  const hydrated = useHydrated();

  const value = useMemo<WatchlistContextValue>(
    () => ({
      items,
      hydrated,
      has: (kind, id) =>
        items.some((item) => item.kind === kind && item.id === id),
      toggle,
      remove,
      clear,
    }),
    [items, hydrated],
  );

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist(): WatchlistContextValue {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error("useWatchlist doit être utilisé dans WatchlistProvider");
  }
  return context;
}
