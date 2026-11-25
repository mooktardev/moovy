import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Règles du React Compiler : SearchBar, ThemeToggle, AgeSpan et
    // WatchlistProvider lisent l'état navigateur (localStorage, horloge)
    // dans des effets. À migrer vers useSyncExternalStore ; d'ici là,
    // ces règles signalent sans bloquer la CI.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
