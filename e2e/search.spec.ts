import { expect, test } from "./test";

test("la recherche de l'en-tête affiche les résultats", async ({ page }) => {
  await page.goto("/");

  await page
    .getByRole("searchbox", { name: "Rechercher un film ou une série" })
    .fill("fight");

  await expect(page).toHaveURL(/\/search\?q=fight$/);
  await expect(page.getByText(/1 résultat pour/)).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Fight Club/ }).first(),
  ).toBeVisible();
});

test("cliquer un résultat ne ramène pas sur la recherche", async ({ page }) => {
  // Régression : la recherche en attente renvoyait sur /search 300 ms après le clic.
  await page.goto("/search?q=pulp");
  await page
    .getByRole("link", { name: /Pulp Fiction/ })
    .first()
    .click();

  await expect(page).toHaveURL(/\/movie\/680$/);
  await page.waitForTimeout(800);
  await expect(page).toHaveURL(/\/movie\/680$/);
});

test("une recherche sans résultat le dit", async ({ page }) => {
  await page.goto("/search?q=zzzz");
  await expect(
    page.getByText("Aucun résultat pour « zzzz ». Essayez un autre titre."),
  ).toBeVisible();
});
