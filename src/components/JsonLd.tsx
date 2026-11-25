import { serializeJsonLd } from "@/lib/seo";

/** Données structurées schema.org, lues par les moteurs de recherche. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
