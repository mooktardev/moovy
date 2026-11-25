import type { Metadata } from "next";

import { MaListeView } from "@/components/MaListeView";

export const metadata: Metadata = {
  title: "Ma liste",
  description:
    "Votre liste de films et séries à voir, enregistrée dans ce navigateur.",
  // Page personnelle ou résultats de recherche : rien à indexer.
  robots: { index: false, follow: true },
};

export default function MaListePage() {
  return <MaListeView />;
}
