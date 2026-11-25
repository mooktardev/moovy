import { expect, test } from "./test";

test("l'accueil mène à une fiche film complète", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Fight Club" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Films populaires" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Voir la fiche" }).click();

  await expect(page).toHaveURL(/\/movie\/550$/);
  await expect(page).toHaveTitle("Fight Club | Moovy");
  await expect(
    page.getByRole("heading", { level: 1, name: "Fight Club" }),
  ).toBeVisible();
  await expect(page.getByText("2 h 19")).toBeVisible();
  await expect(page.getByText("Brad Pitt").first()).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Où regarder" }),
  ).toBeVisible();
  await expect(page.getByRole("img", { name: "Logo Netflix" })).toBeVisible();
});

test("le casting mène à la fiche de l'acteur", async ({ page }) => {
  await page.goto("/movie/550");

  await page
    .getByRole("link", { name: /Brad Pitt/ })
    .first()
    .click();

  await expect(page).toHaveURL(/\/person\/287$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Brad Pitt" }),
  ).toBeVisible();
  await expect(page.getByText("Interprétation")).toBeVisible();
});

test("les catalogues listent films et séries", async ({ page }) => {
  await page.goto("/films");
  await expect(
    page.getByRole("heading", { level: 1, name: "Films" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Pulp Fiction/ }).first(),
  ).toBeVisible();

  await page.goto("/series");
  await expect(
    page.getByRole("heading", { level: 1, name: "Séries" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Game of Thrones/ }).first(),
  ).toBeVisible();
});
