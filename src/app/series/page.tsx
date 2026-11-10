import { Suspense } from "react";
import type { Metadata } from "next";

import { CatalogueContent } from "@/components/CatalogueContent";
import { CatalogueSkeleton } from "@/components/CatalogueSkeleton";

export const metadata: Metadata = {
  title: "Séries",
};

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
