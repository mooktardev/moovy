"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Barre de recherche du header : navigation vers /search?q=…
 * avec debounce de 300 ms. Remplace l'URL quand on est déjà sur /search
 * (pas d'entrées d'historique en série), pousse sinon.
 *
 * La navigation n'est déclenchée que par la saisie de l'utilisateur —
 * jamais par un simple changement d'URL : sans cela, cliquer un résultat
 * de recherche faisait revenir sur /search 300 ms plus tard.
 */
export function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(searchParams.get("q") ?? "");
  /** Requête saisie en attente de navigation (null = rien en attente). */
  const pending = useRef<string | null>(null);
  /** Dernières valeurs de navigation, lues quand le debounce expire. */
  const locationRef = useRef({ pathname, searchParams, router });
  locationRef.current = { pathname, searchParams, router };

  // Resynchronise le champ avec l'URL (retour arrière, lien partagé),
  // sans écraser une saisie en cours (comparaison sur la valeur trimmée).
  const urlQuery = searchParams.get("q") ?? "";
  useEffect(() => {
    if (pathname !== "/search") return;
    setValue((current) => (current.trim() === urlQuery ? current : urlQuery));
  }, [pathname, urlQuery]);

  // Navigation programmée 300 ms après la dernière frappe. L'effet ne
  // réagit qu'à `value` (la saisie) : un changement d'URL ne réarme pas
  // le timer, et toute navigation annule la requête en attente.
  useEffect(() => {
    if (pending.current === null) return;
    const query = pending.current;
    const timer = setTimeout(() => {
      if (pending.current !== query) return;
      pending.current = null;
      const { pathname, searchParams, router } = locationRef.current;
      const current = searchParams.get("q") ?? "";
      const url = query ? `/search?q=${encodeURIComponent(query)}` : "/search";
      if (pathname === "/search") {
        if (query !== current) router.replace(url);
      } else if (query) {
        router.push(url);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  // Toute navigation (clic sur un résultat, retour arrière…) annule
  // la requête en attente : on ne veut pas « ramener » l'utilisateur.
  useEffect(() => {
    pending.current = null;
  }, [pathname, searchParams]);

  return (
    <input
      type="search"
      value={value}
      onChange={(event) => {
        pending.current = event.target.value.trim();
        setValue(event.target.value);
      }}
      placeholder="Rechercher un film…"
      aria-label="Rechercher un film ou une série"
      className={`border-border bg-surface placeholder:text-muted focus:ring-primary w-full rounded-lg border px-4 py-2.5 text-sm focus:ring-2 focus:outline-none ${className}`}
    />
  );
}
