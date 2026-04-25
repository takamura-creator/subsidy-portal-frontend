import type { MetadataRoute } from "next";
import { PREFECTURES, isServicePrefecture } from "@/lib/constants";
import { listPublishedCases } from "@/data/cases";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hojokin-portal.jp";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/match`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/subsidies`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/results`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/partners/multik`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/cases`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];

  const casePages: MetadataRoute.Sitemap = listPublishedCases().map((c) => ({
    url: `${SITE_URL}/cases/${c.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // LP 二層: 6都県=priority 1.0（フル）, 41道府県=priority 0.6（情報のみ）
  const lpPages: MetadataRoute.Sitemap = PREFECTURES.map((pref) => ({
    url: `${SITE_URL}/lp/${encodeURIComponent(pref)}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: isServicePrefecture(pref) ? 1.0 : 0.6,
  }));

  const resultsPrefecturePages: MetadataRoute.Sitemap = PREFECTURES.map((pref) => ({
    url: `${SITE_URL}/results/${encodeURIComponent(pref)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...lpPages, ...casePages, ...resultsPrefecturePages];
}
