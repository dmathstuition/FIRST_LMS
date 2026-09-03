import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/** robots.txt — allow crawling of public pages, block private app areas. */
export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.url.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/admin", "/auth", "/verify/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
