import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hojyocame.jp";

const DISALLOW = ["/api/", "/my/", "/admin/", "/auth/"];
const AI_BOTS = ["GPTBot", "ClaudeBot", "PerplexityBot", "GoogleOther", "Google-Extended"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW,
      },
      // AEO: AI 回答エンジンに明示許可（引用率向上）。robots はグループを継承しないため、
      // 個別グループにも同じ禁止（/api/ /my/ /admin/ /auth/）を書く（2026-10-28 試験 [7]）
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow: DISALLOW })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
