import type { MetadataRoute } from "next";
import { appsData } from "@/lib/apps-data";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages = ["", "/apps", "/today", "/ideas", "/blog"].map((p) => ({ url: `${site.url}${p}`, lastModified: now, changeFrequency: "daily" as const, priority: p === "" ? 1 : 0.8 }));
  const apps = appsData.map((a) => ({ url: `${site.url}/apps/${a.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.7 }));
  return [...pages, ...apps];
}
