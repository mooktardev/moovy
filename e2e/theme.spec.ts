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
