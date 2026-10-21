import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/config";

const ROUTES = ["", "/pricing", "/terms", "/privacy", "/refund"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  const now = new Date();
  return ROUTES.map((r) => ({
    url: `${base}${r}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: r === "" ? 1 : 0.8,
  }));
}
