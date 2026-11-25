import { expect, test } from "./test";

const NOT_FOUND = "Cette page a disparu du montage final";

for (const path of [
  "/movie/999999",
  "/movie/abc",
  "/tv/12abc",
  "/person/999999",
]) {
  test(`${path} affiche la page 404`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: NOT_FOUND })).toBeVisible();
  });
}

test("une panne TMDB affiche la page d'erreur, pas la 404", async ({
  page,
}) => {
  // Le faux TMDB répond 503 pour l'id 503.
  await page.goto("/movie/503");

  await expect(
    page.getByRole("heading", { name: "Une erreur est survenue" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Réessayer" })).toBeVisible();
  await expect(page.getByRole("heading", { name: NOT_FOUND })).toHaveCount(0);
});
