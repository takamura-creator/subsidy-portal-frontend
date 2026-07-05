import type { MetadataRoute } from "next";
import { PREFECTURES, SERVICE_PREFECTURES } from "@/lib/constants";
import { listPublishedCases } from "@/data/cases";
import { getAllSubsidies } from "@/lib/subsidies-server";
import { ARTICLES } from "@/data/articles";
import { INDUSTRY_LPS } from "@/data/industry-lp";
import { JICHIKAI_CASES } from "@/data/cases-jichikai";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hojyocame.jp";

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
    { url: `${SITE_URL}/articles`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/cases/jichikai`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const articlePages: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url: `${SITE_URL}/articles/${a.slug}`,
    lastModified: a.publishedAt,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const industryLpPages: MetadataRoute.Sitemap = INDUSTRY_LPS.map((lp) => ({
    url: `${SITE_URL}/industries/${lp.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const jichikaiCasePages: MetadataRoute.Sitemap = JICHIKAI_CASES.map((c) => ({
    url: `${SITE_URL}/cases/jichikai/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Sprint 4 Task 0 で SSG 化された補助金詳細（getAllSubsidies() の実件数）を Search Console に発見させる
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

  // 47都道府県すべてを /lp/* で配信（2026-05-26）。
  // 6都県（SERVICE_PREFECTURES）は FullLP（施工対応）、41道府県は InformationLP。
  const lpPages: MetadataRoute.Sitemap = PREFECTURES.map((pref) => ({
    url: `${SITE_URL}/lp/${encodeURIComponent(pref)}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: SERVICE_PREFECTURES.includes(pref as (typeof SERVICE_PREFECTURES)[number]) ? 1.0 : 0.6,
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
    ...articlePages,
    ...industryLpPages,
    ...jichikaiCasePages,
  ];
}
