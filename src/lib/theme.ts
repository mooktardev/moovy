/**
 * Thème clair/sombre, exposé comme store externe pour `useSyncExternalStore`.
 * La source de vérité est la classe `.light` sur <html>, posée avant la
 * première peinture par THEME_SCRIPT (layout) ; le choix est persisté
 * dans localStorage et suivi entre onglets.
 */
export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "moovy:theme";

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("light", theme === "light");
}

function onStorage(event: StorageEvent) {
  if (event.key !== THEME_STORAGE_KEY) return;
  applyTheme(event.newValue === "light" ? "light" : "dark");
  emit();
}

export function subscribeTheme(listener: () => void): () => void {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function getTheme(): Theme {
  return document.documentElement.classList.contains("light")
    ? "light"
    : "dark";
}

/** Thème du rendu serveur : le sombre est le défaut du site. */
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
