import type { MetadataRoute } from "next";
import { resourceParams, siteUrl } from "@/lib/resources";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/resources",
    ...resourceParams().map(({ slug }) => `/resources/${slug.join("/")}`),
  ].map((path) => ({ url: `${siteUrl}${path}` }));
}
