import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

import { expect, test } from "./test";

/** Règles WCAG 2.2 A/AA, plus les bonnes pratiques d'axe. */
const TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
  "best-practice",
];

const PAGES = [
  "/",
  "/movie/550",
  "/tv/1399",
  "/person/287",
  "/films",
  "/series",
  "/acteurs",
  "/search?q=fight",
  "/search",
  "/ma-liste",
  "/movie/999999", // 404
  "/movie/503", // page d'erreur (panne TMDB simulée)
];

const WATCHLIST_ITEM = {
  kind: "movie",
  id: 550,
  title: "Fight Club",
  posterPath: "/fight-club.jpg",
  voteAverage: 8.4,
  date: "1999-10-15",
};

// Animations coupées : un élément en plein fondu fausserait les contrastes.
test.use({ reducedMotion: "reduce" });

/** Analyse la page et échoue avec un résumé lisible des violations. */
async function expectNoViolations(page: Page) {
  await page.waitForLoadState("networkidle");
  const { violations } = await new AxeBuilder({ page })
    .withTags(TAGS)
    .analyze();
  const summary = violations.map(
    (violation) =>
      `${violation.id} (${violation.impact}) : ${violation.help}\n` +
      violation.nodes
        .slice(0, 5)
        .map(
          (node) =>
            `  - ${node.target.join(" ")}\n    ${node.failureSummary?.replace(/\n/g, " ")}`,
        )
        .join("\n"),
  );
  expect(summary, summary.join("\n\n")).toEqual([]);
}

for (const theme of ["sombre", "clair"] as const) {
  test.describe(`thème ${theme}`, () => {
    test.beforeEach(async ({ page }) => {
      if (theme === "clair") {
        await page.addInitScript(() =>
          localStorage.setItem("moovy:theme", "light"),
        );
      }
    });

    for (const path of PAGES) {
      test(`${path} respecte WCAG 2.2 AA`, async ({ page }) => {
        await page.goto(path);
        await expectNoViolations(page);
      });
    }

    test("fiche et Ma liste avec un titre enregistré", async ({ page }) => {
      await page.addInitScript((item) => {
        localStorage.setItem("moovy:watchlist", JSON.stringify([item]));
      }, WATCHLIST_ITEM);

      // Bouton « Dans ma liste » actif (texte rose sur fond teinté).
      await page.goto("/movie/550");
      await expect(
        page.getByRole("button", { name: "Dans ma liste" }),
      ).toBeVisible();
      await expectNoViolations(page);

      await page.goto("/ma-liste");
      await expect(
        page.getByRole("link", { name: /Fight Club/ }).first(),
      ).toBeVisible();
      await expectNoViolations(page);
    });
  });
}
