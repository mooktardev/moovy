import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
  // Absent des tests en environnement node (rendu des images OG).
  if (typeof localStorage !== "undefined") localStorage.clear();
});
