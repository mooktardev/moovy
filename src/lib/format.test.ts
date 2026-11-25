import { describe, expect, it } from "vitest";

import {
  formatDateFr,
  formatRating,
  formatRuntime,
  formatYear,
} from "@/lib/format";

describe("formatYear", () => {
  it("extrait l'année", () => expect(formatYear("1999-10-15")).toBe("1999"));
  it("gère l'absence de date", () => {
    expect(formatYear(null)).toBeNull();
    expect(formatYear(undefined)).toBeNull();
    expect(formatYear("")).toBeNull();
  });
});

describe("formatDateFr", () => {
  it("formate en français long", () => {
    expect(formatDateFr("1963-03-12")).toBe("12 mars 1963");
  });
  it("renvoie null pour une date absente ou invalide", () => {
    expect(formatDateFr(null)).toBeNull();
    expect(formatDateFr("pas-une-date")).toBeNull();
  });
});

describe("formatRating", () => {
  it("utilise une décimale et la virgule", () => {
    expect(formatRating(8)).toBe("8,0");
    expect(formatRating(7.456)).toBe("7,5");
  });
});

describe("formatRuntime", () => {
  it.each([
    [139, "2 h 19"],
    [120, "2 h"],
    [65, "1 h 05"],
  ])("%i min → %s", (minutes, expected) => {
    expect(formatRuntime(minutes)).toBe(expected);
  });
  it("renvoie null sans durée", () => {
    expect(formatRuntime(0)).toBeNull();
    expect(formatRuntime(null)).toBeNull();
  });
});
