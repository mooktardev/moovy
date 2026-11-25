import { afterEach, describe, expect, it, vi } from "vitest";

import {
  THEME_SCRIPT,
  THEME_STORAGE_KEY,
  getTheme,
  resolveTheme,
  setTheme,
  subscribeTheme,
} from "@/lib/theme";

/** Faux `matchMedia` : préférence système pilotable, écouteurs « change ». */
function mockSystem(prefersLight: boolean) {
  const listeners = new Set<() => void>();
  const media = {
    get matches() {
      return prefersLight;
    },
    addEventListener: (_: string, listener: () => void) =>
      listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) =>
      listeners.delete(listener),
  };
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => media),
  );
  return {
    change(light: boolean) {
      prefersLight = light;
      for (const listener of listeners) listener();
    },
  };
}

const isLight = () => document.documentElement.classList.contains("light");

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.classList.remove("light");
});

describe("thème initial (script inline et resolveTheme)", () => {
  const cases = [
    { stored: null, system: false, expected: "dark" },
    { stored: null, system: true, expected: "light" },
    { stored: "dark", system: true, expected: "dark" },
    { stored: "light", system: false, expected: "light" },
    { stored: "n'importe quoi", system: true, expected: "light" },
  ] as const;

  for (const { stored, system, expected } of cases) {
    it(`choix ${stored ?? "aucun"}, système ${system ? "clair" : "sombre"} → ${expected}`, () => {
      mockSystem(system);
      if (stored !== null) localStorage.setItem(THEME_STORAGE_KEY, stored);

      expect(resolveTheme()).toBe(expected);

      // Le script inline doit aboutir exactement au même thème.
      new Function(THEME_SCRIPT)();
      expect(isLight()).toBe(expected === "light");
    });
  }

  it("le script tolère l'absence de matchMedia et de stockage", () => {
    vi.stubGlobal("matchMedia", undefined);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("stockage bloqué");
    });
    expect(() => new Function(THEME_SCRIPT)()).not.toThrow();
    expect(isLight()).toBe(false);
    vi.restoreAllMocks();
  });
});

describe("préférence système en direct", () => {
  it("est suivie tant que l'utilisateur n'a rien choisi", () => {
    const system = mockSystem(false);
    const listener = vi.fn();
    const unsubscribe = subscribeTheme(listener);

    system.change(true);
    expect(getTheme()).toBe("light");
    expect(listener).toHaveBeenCalled();

    system.change(false);
    expect(getTheme()).toBe("dark");
    unsubscribe();
  });

  it("est ignorée après un choix explicite", () => {
    const system = mockSystem(false);
    const unsubscribe = subscribeTheme(() => {});

    setTheme("dark");
    system.change(true);

    expect(getTheme()).toBe("dark");
    unsubscribe();
  });

  it("reprend la main si un autre onglet efface le choix", () => {
    mockSystem(true);
    const unsubscribe = subscribeTheme(() => {});
    setTheme("dark");

    localStorage.removeItem(THEME_STORAGE_KEY);
    window.dispatchEvent(
      new StorageEvent("storage", { key: THEME_STORAGE_KEY, newValue: null }),
    );

    expect(getTheme()).toBe("light");
    unsubscribe();
  });
});
