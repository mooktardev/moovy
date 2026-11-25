import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/seo";

/** Tout est explorable ; /search et /ma-liste sont exclues par `noindex`
 * (une règle Disallow empêcherait les robots de lire cette consigne). */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${base}/sitemap.xml`,
  };
}
