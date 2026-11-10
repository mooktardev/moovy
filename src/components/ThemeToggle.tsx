"use client";

import { useEffect, useState } from "react";

/**
 * Bascule thème clair/sombre. La classe `.light` sur <html> redéfinit
 * les tokens neutres (globals.css) ; le choix est persisté dans
 * localStorage et appliqué avant la première peinture (THEME_SCRIPT).
 */
export function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    setIsLight(document.documentElement.classList.contains("light"));
  }, []);

  function toggle() {
    const next = isLight ? "dark" : "light";
    document.documentElement.classList.toggle("light", next === "light");
    try {
      localStorage.setItem("moovy:theme", next);
    } catch {
      // Mode privé : le choix vivra juste en mémoire pour la session.
    }
    setIsLight(next === "light");
  }

  const label = isLight ? "Activer le thème sombre" : "Activer le thème clair";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="border-border bg-surface-2 text-foreground hover:bg-surface focus-visible:ring-primary rounded-lg border p-2 transition duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none"
    >
      {isLight ? (
        // Lune : on propose de repasser en sombre
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
        >
          <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
        </svg>
      ) : (
        // Soleil : on propose de passer en clair
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      )}
    </button>
  );
}
