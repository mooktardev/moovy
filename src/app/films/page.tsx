import { Suspense } from "react";
import type { Metadata } from "next";

import { CatalogueContent } from "@/components/CatalogueContent";
import { CatalogueSkeleton } from "@/components/CatalogueSkeleton";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Films",
  description:
    "Catalogue de films à parcourir par genre, année, popularité ou note, avec fiches détaillées et bandes-annonces.",
  path: "/films",
});

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
