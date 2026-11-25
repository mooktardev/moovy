import { Suspense } from "react";
import type { Metadata } from "next";

import { CatalogueContent } from "@/components/CatalogueContent";
import { CatalogueSkeleton } from "@/components/CatalogueSkeleton";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Séries",
  description:
    "Catalogue de séries à parcourir par genre, année, popularité ou note, avec saisons, casting et bandes-annonces.",
  path: "/series",
});

export default async function SeriesPage(props: PageProps<"/series">) {
  return (
    <Suspense fallback={<CatalogueSkeleton />}>
      <CatalogueContent
        kind="tv"
        title="Séries"
        searchParams={props.searchParams}
      />
    </Suspense>
  );
}
