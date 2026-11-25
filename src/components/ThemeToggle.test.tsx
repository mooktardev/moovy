import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ThemeToggle } from "@/components/ThemeToggle";
import { THEME_STORAGE_KEY } from "@/lib/theme";

const button = () => screen.getByRole("button");
const isLightClass = () => document.documentElement.classList.contains("light");

afterEach(() => {
  document.documentElement.classList.remove("light");
});

describe("ThemeToggle", () => {
  it("reflète le thème sombre par défaut", () => {
    render(<ThemeToggle />);
    expect(button()).toHaveAccessibleName("Activer le thème clair");
  });

  it("reflète le thème clair appliqué avant l'hydratation", () => {
    document.documentElement.classList.add("light");
    render(<ThemeToggle />);
    expect(button()).toHaveAccessibleName("Activer le thème sombre");
  });

  it("bascule le thème, la classe <html> et le stockage", () => {
    render(<ThemeToggle />);

    act(() => button().click());
    expect(isLightClass()).toBe(true);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(button()).toHaveAccessibleName("Activer le thème sombre");

    act(() => button().click());
    expect(isLightClass()).toBe(false);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(button()).toHaveAccessibleName("Activer le thème clair");
  });

  it("garde les boutons synchronisés entre eux", () => {
    render(
      <>
        <ThemeToggle />
        <ThemeToggle />
      </>,
    );
    const [first, second] = screen.getAllByRole("button");
    act(() => first.click());
    expect(second).toHaveAccessibleName("Activer le thème sombre");
  });

  it("suit le thème choisi dans un autre onglet", () => {
    render(<ThemeToggle />);

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: THEME_STORAGE_KEY,
          newValue: "light",
        }),
      );
    });

    expect(isLightClass()).toBe(true);
    expect(button()).toHaveAccessibleName("Activer le thème sombre");
  });
});
