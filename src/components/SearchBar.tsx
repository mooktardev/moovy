"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Barre de recherche du header : navigation vers /search?q=…
 * avec debounce de 300 ms. Remplace l'URL quand on est déjà sur /search
 * (pas d'entrées d'historique en série), pousse sinon.
 */
export function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    const query = value.trim();
    const timer = setTimeout(() => {
      const current = searchParams.get("q") ?? "";
      if (query === current) return;

      const url = query ? `/search?q=${encodeURIComponent(query)}` : "/search";
      if (pathname === "/search") {
        router.replace(url);
      } else if (query) {
        router.push(url);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [value, pathname, searchParams, router]);

  return (
    <input
      type="search"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      placeholder="Rechercher un film…"
      aria-label="Rechercher un film ou une série"
      className={`border-border bg-surface placeholder:text-muted focus:ring-primary w-full rounded-lg border px-4 py-2.5 text-sm focus:ring-2 focus:outline-none ${className}`}
    />
  );
}
