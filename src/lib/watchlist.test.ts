import { describe, expect, it } from "vitest";

import {
  readWatchlist,
  toWatchlistItem,
  watchlistKey,
  writeWatchlist,
  type WatchlistItem,
} from "@/lib/watchlist";
import type { MediaItem } from "@/types/tmdb";

const STORAGE_KEY = "moovy:watchlist";

const fightClub: WatchlistItem = {
  kind: "movie",
  id: 550,
  title: "Fight Club",
  posterPath: "/poster.jpg",
  voteAverage: 8.4,
  date: "1999-10-15",
};

describe("toWatchlistItem", () => {
  it("convertit un film", () => {
    const movie: MediaItem = {
      id: 550,
      title: "Fight Club",
      overview: null,
      poster_path: "/poster.jpg",
      backdrop_path: null,
      vote_average: 8.4,
      release_date: "1999-10-15",
    };
    expect(toWatchlistItem(movie, "movie")).toEqual(fightClub);
  });

  it("utilise name et first_air_date pour une série", () => {
    const show: MediaItem = {
      id: 1399,
      name: "Game of Thrones",
      overview: null,
      poster_path: null,
      backdrop_path: null,
      vote_average: 8.5,
      first_air_date: "2011-04-17",
    };
    expect(toWatchlistItem(show, "tv")).toMatchObject({
      kind: "tv",
      title: "Game of Thrones",
      date: "2011-04-17",
      posterPath: null,
    });
  });
});

describe("watchlistKey", () => {
  it("distingue un film et une série de même id", () => {
    expect(watchlistKey({ kind: "movie", id: 1 })).not.toBe(
      watchlistKey({ kind: "tv", id: 1 }),
    );
  });
});

describe("readWatchlist / writeWatchlist", () => {
  it("relit ce qui a été écrit", () => {
    writeWatchlist([fightClub]);
    expect(readWatchlist()).toEqual([fightClub]);
  });

  it("renvoie [] si rien n'est stocké", () => {
    expect(readWatchlist()).toEqual([]);
  });

  it("renvoie [] pour du JSON corrompu", () => {
    localStorage.setItem(STORAGE_KEY, "{pas du json");
    expect(readWatchlist()).toEqual([]);
  });

  it("renvoie [] si la valeur n'est pas un tableau", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: 1 }));
    expect(readWatchlist()).toEqual([]);
  });

  it("écarte les entrées invalides et garde les valides", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        fightClub,
        null,
        { kind: "person", id: 1, title: "x" },
        { kind: "tv", id: "2" },
      ]),
    );
    expect(readWatchlist()).toEqual([fightClub]);
  });
});
