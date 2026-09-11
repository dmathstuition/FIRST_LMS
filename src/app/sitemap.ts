import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { getPublishedCourses } from "@/features/courses/queries";
import { getPublishedSlugs } from "@/features/blog/queries";

/** Dynamic sitemap including every published course and blog post. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/courses`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/blog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/verify`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/login`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/register`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/refunds`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const [courses, blogSlugs] = await Promise.all([
    getPublishedCourses(),
    getPublishedSlugs(),
  ]);
  const courseRoutes: MetadataRoute.Sitemap = courses.map((c) => ({
    url: `${base}/courses/${c.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));
  const blogRoutes: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${base}/blog/${slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...courseRoutes, ...blogRoutes];
}
