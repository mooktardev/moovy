import { Suspense } from "react";
import type { Metadata } from "next";

import { CatalogueContent } from "@/components/CatalogueContent";
import { CatalogueSkeleton } from "@/components/CatalogueSkeleton";

export const metadata: Metadata = {
  title: "Films",
};

export default async function FilmsPage(props: PageProps<"/films">) {
  return (
    <Suspense fallback={<CatalogueSkeleton />}>
      <CatalogueContent
        kind="movie"
        title="Films"
        searchParams={props.searchParams}
      />
    </Suspense>
  );
}
