import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SearchBar } from "@/components/SearchBar";

/**
 * Faux routeur Next : l'URL courante est pilotée par les tests. Comme
 * Next, `useSearchParams` garde la même instance tant que l'URL ne change pas.
 */
const nav = vi.hoisted(() => {
  const state = {
    pathname: "/",
    search: "",
    params: new URLSearchParams(),
    push: vi.fn(),
    replace: vi.fn(),
    searchParams() {
      if (
        state.params.toString() !== new URLSearchParams(state.search).toString()
      ) {
        state.params = new URLSearchParams(state.search);
      }
      return state.params;
    },
  };
  return state;
});

vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useSearchParams: () => nav.searchParams(),
  useRouter: () => ({ push: nav.push, replace: nav.replace }),
}));

const input = () => screen.getByRole("searchbox") as HTMLInputElement;
const type = (value: string) =>
  fireEvent.change(input(), { target: { value } });
const wait = (ms: number) => act(() => vi.advanceTimersByTime(ms));

/** Simule une navigation puis re-rend la barre avec la nouvelle URL. */
function navigate(rerender: (ui: React.ReactElement) => void, url: string) {
  const [pathname, search = ""] = url.split("?");
  nav.pathname = pathname;
  nav.search = search;
  rerender(<SearchBar />);
}

beforeEach(() => {
  vi.useFakeTimers();
  nav.pathname = "/";
  nav.search = "";
  nav.push.mockReset();
  nav.replace.mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("SearchBar", () => {
  it("pré-remplit le champ depuis l'URL", () => {
    nav.pathname = "/search";
    nav.search = "q=dune";
    render(<SearchBar />);
    expect(input().value).toBe("dune");
  });

  it("pousse /search?q=… 300 ms après la dernière frappe", () => {
    render(<SearchBar />);
    type("d");
    wait(200);
    type("dune");
    wait(299);
    expect(nav.push).not.toHaveBeenCalled();

    wait(1);
    expect(nav.push).toHaveBeenCalledExactlyOnceWith("/search?q=dune");
    expect(nav.replace).not.toHaveBeenCalled();
  });

  it("encode la requête et ignore les espaces autour", () => {
    render(<SearchBar />);
    type("  le parrain & co ");
    wait(300);
    expect(nav.push).toHaveBeenCalledWith("/search?q=le%20parrain%20%26%20co");
  });

  it("ne navigue pas pour une saisie vide hors de /search", () => {
    render(<SearchBar />);
    type("   ");
    wait(300);
    expect(nav.push).not.toHaveBeenCalled();
  });

  it("remplace l'URL quand on est déjà sur /search", () => {
    nav.pathname = "/search";
    nav.search = "q=dune";
    render(<SearchBar />);

    type("dune 2");
    wait(300);
    expect(nav.replace).toHaveBeenCalledExactlyOnceWith("/search?q=dune%202");

    type("");
    wait(300);
    expect(nav.replace).toHaveBeenLastCalledWith("/search");
    expect(nav.push).not.toHaveBeenCalled();
  });

  it("ne remplace pas l'URL si la requête n'a pas changé", () => {
    nav.pathname = "/search";
    nav.search = "q=dune";
    render(<SearchBar />);
    type("dune ");
    wait(300);
    expect(nav.replace).not.toHaveBeenCalled();
  });

  it("annule la recherche en attente si l'utilisateur navigue", () => {
    // Régression : cliquer un résultat ramenait sur /search 300 ms plus tard.
    nav.pathname = "/search";
    nav.search = "q=dune";
    const { rerender } = render(<SearchBar />);

    type("dune 2");
    wait(100);
    navigate(rerender, "/movie/438631");
    wait(500);

    expect(nav.push).not.toHaveBeenCalled();
    expect(nav.replace).not.toHaveBeenCalled();
  });

  it("ne relance pas de navigation sur un simple changement d'URL", () => {
    nav.pathname = "/search";
    nav.search = "q=dune";
    const { rerender } = render(<SearchBar />);
    navigate(rerender, "/search?q=alien");
    wait(500);
    expect(nav.push).not.toHaveBeenCalled();
    expect(nav.replace).not.toHaveBeenCalled();
  });

  it("se resynchronise avec l'URL (retour arrière)", () => {
    nav.pathname = "/search";
    nav.search = "q=dune";
    const { rerender } = render(<SearchBar />);
    navigate(rerender, "/search?q=alien");
    expect(input().value).toBe("alien");
  });

  it("reprend la requête de l'URL en revenant sur /search", () => {
    const { rerender } = render(<SearchBar />);
    navigate(rerender, "/search?q=alien");
    expect(input().value).toBe("alien");
  });

  it("garde le champ tel quel en quittant /search", () => {
    nav.pathname = "/search";
    nav.search = "q=dune";
    const { rerender } = render(<SearchBar />);
    navigate(rerender, "/movie/438631");
    expect(input().value).toBe("dune");
  });

  it("n'écrase pas la saisie en cours quand l'URL la rattrape", () => {
    nav.pathname = "/search";
    nav.search = "q=dune";
    const { rerender } = render(<SearchBar />);

    type("alien ");
    wait(300);
    expect(nav.replace).toHaveBeenCalledWith("/search?q=alien");
    navigate(rerender, "/search?q=alien");

    // L'espace final tapé par l'utilisateur est conservé.
    expect(input().value).toBe("alien ");
  });
});
