"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  readWatchlist,
  watchlistKey,
  writeWatchlist,
  type WatchlistItem,
} from "@/lib/watchlist";

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

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Chargement après l'hydratation : le rendu serveur et le premier rendu
  // client sont identiques (liste vide), pas de mismatch.
  useEffect(() => {
    setItems(readWatchlist());
    setHydrated(true);
  }, []);

  // Persistance à chaque changement.
  useEffect(() => {
    if (hydrated) writeWatchlist(items);
  }, [items, hydrated]);

  // Synchronisation entre onglets.
  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === "moovy:watchlist") setItems(readWatchlist());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const has = useCallback(
    (kind: WatchlistItem["kind"], id: number) =>
      items.some((item) => item.kind === kind && item.id === id),
    [items],
  );

  const toggle = useCallback((item: WatchlistItem) => {
    const key = watchlistKey(item);
    setItems((previous) =>
      previous.some((entry) => watchlistKey(entry) === key)
        ? previous.filter((entry) => watchlistKey(entry) !== key)
        : [item, ...previous],
    );
  }, []);

  const remove = useCallback((kind: WatchlistItem["kind"], id: number) => {
    const key = `${kind}-${id}`;
    setItems((previous) =>
      previous.filter((entry) => watchlistKey(entry) !== key),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, hydrated, has, toggle, remove, clear }),
    [items, hydrated, has, toggle, remove, clear],
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
