import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/format";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return ["", "/about", "/start", "/legal"].map((path) => ({ url: `${base}${path}` }));
}
