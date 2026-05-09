import type { MetadataRoute } from "next";
import { SERVICE_PREFECTURES } from "@/lib/constants";
import { listPublishedCases } from "@/data/cases";
import { getAllSubsidies } from "@/lib/subsidies-server";

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
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Sprint 4 Task 0 で SSG 化された補助金詳細（57 件）を Search Console に発見させる
  const subsidyPages: MetadataRoute.Sitemap = getAllSubsidies().map((s) => ({
    url: `${SITE_URL}/subsidies/${s.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const casePages: MetadataRoute.Sitemap = listPublishedCases().map((c) => ({
    url: `${SITE_URL}/cases/${c.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const lpPages: MetadataRoute.Sitemap = SERVICE_PREFECTURES.map((pref) => ({
    url: `${SITE_URL}/lp/${encodeURIComponent(pref)}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 1.0,
  }));

  const resultsPrefecturePages: MetadataRoute.Sitemap = SERVICE_PREFECTURES.map((pref) => ({
    url: `${SITE_URL}/results/${encodeURIComponent(pref)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...subsidyPages,
    ...lpPages,
    ...casePages,
    ...resultsPrefecturePages,
  ];
}
