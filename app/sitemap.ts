import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl().origin;
  return ["", "/generator", "/invoice", "/about", "/privacy", "/terms", "/contact"].map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: path === "" ? 1 : 0.6,
    }),
  );
}
