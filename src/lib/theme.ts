/**
 * Thème clair/sombre, exposé comme store externe pour `useSyncExternalStore`.
 * La source de vérité est la classe `.light` sur <html>, posée avant la
 * première peinture par THEME_SCRIPT (layout). Thème appliqué : le choix
 * enregistré (bouton du site), sinon la préférence du système. Le choix
 * est persisté dans localStorage et suivi entre onglets ; sans choix, un
 * changement de thème du système est suivi en direct.
 */
export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "moovy:theme";

const SYSTEM_LIGHT_QUERY = "(prefers-color-scheme: light)";

/**
 * Script inline du layout, exécuté avant la première peinture (pas de
 * flash). Même logique que `resolveTheme`, vérifiée par les tests.
 */
export const THEME_SCRIPT = `(function(){var t=null;try{t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)})}catch(e){}if(t!=="light"&&t!=="dark")t=window.matchMedia&&window.matchMedia(${JSON.stringify(SYSTEM_LIGHT_QUERY)}).matches?"light":"dark";if(t==="light")document.documentElement.classList.add("light")})()`;

/** Choix enregistré via le bouton, ou null si l'utilisateur n'a jamais choisi. */
function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function systemMedia(): MediaQueryList | null {
  return typeof window.matchMedia === "function"
    ? window.matchMedia(SYSTEM_LIGHT_QUERY)
    : null;
}

function systemTheme(): Theme {
  return systemMedia()?.matches ? "light" : "dark";
}

/** Thème à appliquer : le choix enregistré, sinon la préférence du système. */
export function resolveTheme(): Theme {
  return storedTheme() ?? systemTheme();
}

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("light", theme === "light");
}

/** Réapplique le thème résolu (page d'erreur globale, sans script inline). */
export function applyResolvedTheme(): void {
  applyTheme(resolveTheme());
}

/** Un autre onglet a changé (ou effacé) le choix enregistré. */
function onStorage(event: StorageEvent) {
  if (event.key !== THEME_STORAGE_KEY) return;
  applyTheme(resolveTheme());
  emit();
}

/** Le système a changé de thème : suivi seulement sans choix enregistré. */
function onSystemChange() {
  if (storedTheme() !== null) return;
  applyTheme(systemTheme());
  emit();
}

export function subscribeTheme(listener: () => void): () => void {
  if (listeners.size === 0) {
    window.addEventListener("storage", onStorage);
    systemMedia()?.addEventListener("change", onSystemChange);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.removeEventListener("storage", onStorage);
      systemMedia()?.removeEventListener("change", onSystemChange);
    }
  };
}

export function getTheme(): Theme {
  return document.documentElement.classList.contains("light")
    ? "light"
    : "dark";
}

/** Thème du rendu serveur (préférence inconnue) : le sombre, défaut du site.
 * Le navigateur prend le relais à l'hydratation. */
export function getServerTheme(): Theme {
  return "dark";
}

export function setTheme(theme: Theme): void {
  applyTheme(theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Mode privé : le choix vivra juste en mémoire pour la session.
  }
  emit();
}
