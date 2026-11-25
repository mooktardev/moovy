import { test as base, expect } from "@playwright/test";

/** PNG 1×1 servi à la place des images TMDB : aucune requête externe. */
const PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

/**
 * `test` du projet : les images (optimiseur next/image ou TMDB direct)
 * reçoivent un pixel, YouTube est bloqué. Posé sur le contexte pour
 * couvrir aussi les onglets ouverts par un test (synchronisation).
 */
export const test = base.extend({
  // Le 2e argument s'appelle d'habitude `use` : renommé pour ne pas
  // être pris pour le hook React du même nom par ESLint.
  context: async ({ context }, provide) => {
    await context.route(/\/_next\/image\?|image\.tmdb\.org/, (route) =>
      route.fulfill({ contentType: "image/png", body: PIXEL }),
    );
    await context.route(/youtube(-nocookie)?\.com|ytimg\.com/, (route) =>
      route.abort(),
    );
    await provide(context);
  },
});

export { expect };
