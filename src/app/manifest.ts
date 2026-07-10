import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

/** PWA web app manifest. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0F172A",
    theme_color: "#2563EB",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
    ],
  };
}
