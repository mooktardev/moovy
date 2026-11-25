import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Les tests e2e construisent l'app avec le faux TMDB dans un dossier à
  // part, pour ne jamais mélanger ce build avec celui du développement.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
