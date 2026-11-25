import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  WatchlistProvider,
  useWatchlist,
} from "@/components/WatchlistProvider";
import type { WatchlistItem } from "@/lib/watchlist";

const STORAGE_KEY = "moovy:watchlist";

const movie: WatchlistItem = {
  kind: "movie",
  id: 550,
  title: "Fight Club",
  posterPath: null,
  voteAverage: 8.4,
  date: "1999-10-15",
};
const show: WatchlistItem = { ...movie, kind: "tv", title: "Série même id" };

/** Expose l'état du contexte et ses actions sous forme de boutons. */
function Probe() {
  const { items, hydrated, has, toggle, remove, clear } = useWatchlist();
  return (
    <div>
      <p data-testid="state">{hydrated ? "prêt" : "chargement"}</p>
      <p data-testid="titles">{items.map((item) => item.title).join(" | ")}</p>
      <p data-testid="has-movie">{String(has("movie", 550))}</p>
      <button onClick={() => toggle(movie)}>toggle film</button>
      <button onClick={() => toggle(show)}>toggle série</button>
      <button onClick={() => remove("movie", 550)}>retirer film</button>
      <button onClick={clear}>vider</button>
    </div>
  );
}

function renderProvider() {
  return render(
    <WatchlistProvider>
      <Probe />
    </WatchlistProvider>,
  );
}

const titles = () => screen.getByTestId("titles").textContent;
const stored = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
const click = (name: string) => act(() => screen.getByText(name).click());

describe("WatchlistProvider", () => {
  it("charge la liste existante après l'hydratation", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([movie]));
    renderProvider();
    expect(screen.getByTestId("state")).toHaveTextContent("prêt");
    expect(titles()).toBe("Fight Club");
    expect(screen.getByTestId("has-movie")).toHaveTextContent("true");
  });

  it("ajoute en tête puis retire au second toggle, en persistant", () => {
    renderProvider();

    click("toggle film");
    click("toggle série");
    expect(titles()).toBe("Série même id | Fight Club");
    expect(stored()).toHaveLength(2);

    click("toggle film");
    expect(titles()).toBe("Série même id");
    expect(stored()).toEqual([show]);
  });

  it("distingue film et série de même id lors d'un retrait", () => {
    renderProvider();
    click("toggle film");
    click("toggle série");

    click("retirer film");

    expect(titles()).toBe("Série même id");
    expect(screen.getByTestId("has-movie")).toHaveTextContent("false");
  });

  it("vide la liste", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([movie, show]));
    renderProvider();
    click("vider");
    expect(titles()).toBe("");
    expect(stored()).toEqual([]);
  });

  it("se synchronise quand un autre onglet modifie la liste", () => {
    renderProvider();
    expect(titles()).toBe("");

    act(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([show]));
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
    });

    expect(titles()).toBe("Série même id");
  });

  it("ignore les événements de stockage d'autres clés", () => {
    renderProvider();
    act(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([show]));
      window.dispatchEvent(new StorageEvent("storage", { key: "moovy:theme" }));
    });
    expect(titles()).toBe("");
  });

  it("refuse d'être utilisé hors du provider", () => {
    expect(() => render(<Probe />)).toThrow(/WatchlistProvider/);
  });
});
