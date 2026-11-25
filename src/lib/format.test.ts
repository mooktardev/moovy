import { describe, expect, it } from "vitest";

import {
  ageInYears,
  departmentLabel,
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

describe("ageInYears", () => {
  const on = (date: string) => new Date(`${date}T12:00:00`);

  it("compte les années révolues", () => {
    expect(ageInYears("1963-12-18", on("2026-12-18"))).toBe(63);
    expect(ageInYears("1963-12-18", on("2026-12-17"))).toBe(62);
    expect(ageInYears("1963-12-18", on("2026-01-01"))).toBe(62);
  });

  it("gère le mois de l'anniversaire avant et après le jour", () => {
    expect(ageInYears("1990-06-15", on("2020-06-14"))).toBe(29);
    expect(ageInYears("1990-06-15", on("2020-06-16"))).toBe(30);
  });

  it("calcule l'âge au décès", () => {
    expect(ageInYears("1926-06-01", on("1962-08-04"))).toBe(36);
  });
});

describe("departmentLabel", () => {
  it("traduit les départements connus", () => {
    expect(departmentLabel("Acting")).toBe("Interprétation");
    expect(departmentLabel("Directing")).toBe("Réalisation");
  });
  it("garde les inconnus et gère l'absence", () => {
    expect(departmentLabel("Lighting")).toBe("Lighting");
    expect(departmentLabel(null)).toBeNull();
  });
});
