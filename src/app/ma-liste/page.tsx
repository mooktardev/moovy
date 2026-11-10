import type { Metadata } from "next";

import { MaListeView } from "@/components/MaListeView";

export const metadata: Metadata = {
  title: "Ma liste",
};

export default function MaListePage() {
  return <MaListeView />;
}
