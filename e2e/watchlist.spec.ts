import { expect, test } from "./test";

test("Ma liste : ajout depuis une fiche, persistance, retrait", async ({
  page,
}) => {
  await page.goto("/ma-liste");
  await expect(
    page.getByText("Votre liste est vide pour le moment."),
  ).toBeVisible();

  await page.goto("/movie/550");
  const add = page.getByRole("button", {
    name: "Ajouter « Fight Club » à ma liste",
  });
  await add.first().click();
  await expect(
    page
      .getByRole("button", { name: "Retirer « Fight Club » de ma liste" })
      .first(),
  ).toHaveAttribute("aria-pressed", "true");

  await page.goto("/ma-liste");
  await expect(
    page.getByRole("link", { name: /Fight Club/ }).first(),
  ).toBeVisible();

  // La liste survit à un rechargement complet (localStorage).
  await page.reload();
  await expect(
    page.getByRole("link", { name: /Fight Club/ }).first(),
  ).toBeVisible();

  await page
    .getByRole("button", { name: "Retirer « Fight Club » de ma liste" })
    .first()
    .click();
  await expect(
    page.getByText("Votre liste est vide pour le moment."),
  ).toBeVisible();
});

test("Ma liste est synchronisée entre deux onglets", async ({
  page,
  context,
}) => {
  const other = await context.newPage();
  await other.goto("/ma-liste");
  await expect(
    other.getByText("Votre liste est vide pour le moment."),
  ).toBeVisible();

  await page.goto("/movie/680");
  await page
    .getByRole("button", { name: "Ajouter « Pulp Fiction » à ma liste" })
    .first()
    .click();

  await expect(
    other.getByRole("link", { name: /Pulp Fiction/ }).first(),
  ).toBeVisible();
});
