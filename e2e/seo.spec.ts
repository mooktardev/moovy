import { expect, test } from "./test";

test("une fiche expose canonique, Open Graph et JSON-LD", async ({ page }) => {
  await page.goto("/movie/550");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "http://localhost:3100/movie/550",
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    "content",
    "video.movie",
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /\/movie\/550\/opengraph-image/,
  );

  // Pendant le streaming, le segment caché et sa copie finale coexistent
  // un instant : on attend le DOM final, qui ne doit en contenir qu'un.
  const script = page.locator('script[type="application/ld+json"]');
  await expect(script).toHaveCount(1);
  const jsonLd = JSON.parse((await script.textContent()) ?? "{}");
  expect(jsonLd).toMatchObject({
    "@type": "Movie",
    name: "Fight Club",
    aggregateRating: { ratingValue: 8.4, ratingCount: 30000 },
  });
});

test("Ma liste n'est pas indexée", async ({ page }) => {
  await page.goto("/ma-liste");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
});

test("robots.txt et sitemap.xml", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Sitemap: http://localhost:3100/sitemap.xml");

  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const path of [
    "/films",
    "/movie/550",
    "/movie/680",
    "/tv/1399",
    "/person/287",
  ]) {
    expect(sitemap).toContain(`<loc>http://localhost:3100${path}</loc>`);
  }
});
