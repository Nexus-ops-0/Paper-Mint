import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl().origin,
    path = process.env.ADMIN_PATH;
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: path
        ? [path, `${path}/`, `/api/${path.replace(/^\//, "")}`]
        : [],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
