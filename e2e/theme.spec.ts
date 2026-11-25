import { expect, test } from "./test";

test("le thème clair est conservé, sans flash au chargement", async ({
  page,
}) => {
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).not.toHaveClass(/\blight\b/);

  await page.getByRole("button", { name: "Activer le thème clair" }).click();
  await expect(html).toHaveClass(/\blight\b/);

  // La classe doit être posée par le script inline, avant l'hydratation.
  await page.reload({ waitUntil: "domcontentloaded" });
  expect(
    await page.evaluate(() =>
      document.documentElement.classList.contains("light"),
    ),
  ).toBe(true);
  await expect(
    page.getByRole("button", { name: "Activer le thème sombre" }),
  ).toBeVisible();
});

test.describe("système en thème clair", () => {
  test.use({ colorScheme: "light" });

  test("le site suit le système à la première visite", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    // Posé par le script inline : pas de flash sombre.
    expect(
      await page.evaluate(() =>
        document.documentElement.classList.contains("light"),
      ),
    ).toBe(true);
    await expect(
      page.getByRole("button", { name: "Activer le thème sombre" }),
    ).toBeVisible();
  });

  test("un choix explicite l'emporte sur le système", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Activer le thème sombre" }).click();

    await page.reload({ waitUntil: "domcontentloaded" });
    expect(
      await page.evaluate(() =>
        document.documentElement.classList.contains("light"),
      ),
    ).toBe(false);
    await expect(
      page.getByRole("button", { name: "Activer le thème clair" }),
    ).toBeVisible();
  });
});
