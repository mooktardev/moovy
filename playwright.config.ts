import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const MOCK_TMDB_PORT = 4010;
const BASE_URL = `http://localhost:${PORT}`;

/**
 * Tests de bout en bout : build de production de l'app branché sur un
 * faux TMDB (e2e/mock-tmdb), puis parcours réels dans Chromium.
 * Pour déboguer un échec : npx playwright test <fichier> --trace on
 */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: BASE_URL,
    locale: "fr-FR",
    // Le site suit le thème du système quand rien n'est choisi : on fixe le
    // sombre (Playwright émule le clair par défaut) pour des tests stables.
    colorScheme: "dark",
    trace: "off",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: [
    {
      command: `node e2e/mock-tmdb/server.mjs ${MOCK_TMDB_PORT}`,
      url: `http://127.0.0.1:${MOCK_TMDB_PORT}/3/genre/movie/list`,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: `npm run build && npm run start -- --port ${PORT}`,
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 240_000,
      env: {
        NEXT_DIST_DIR: ".next-e2e",
        NEXT_TELEMETRY_DISABLED: "1",
        NEXT_PUBLIC_SITE_URL: BASE_URL,
        TMDB_API_URL: `http://127.0.0.1:${MOCK_TMDB_PORT}/3`,
        TMDB_ACCESS_TOKEN: "jeton-e2e",
        TMDB_API_KEY: "",
      },
    },
  ],
});
