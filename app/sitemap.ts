import { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { MODEL_SLUGS } from "./tools/tokencraft/_lib/modelPages";
import { MODEL_CATALOG_GENERATED_AT } from "./tools/tokencraft/_lib/priceService";

export default function sitemap(): MetadataRoute.Sitemap {
  const catalogDate = new Date(MODEL_CATALOG_GENERATED_AT);
  return [
    {
      url: `${siteUrl()}/tools/tokencraft`,
      lastModified: catalogDate,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...[...MODEL_SLUGS.keys()].map((slug) => ({
      url: `${siteUrl()}/tools/tokencraft/models/${slug}`,
      lastModified: catalogDate,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
