import type { Metadata } from "next";
import Link from "next/link";
import PublicPageLayout from "@/components/layout/PublicPageLayout";
import PublicSectionHeader from "@/components/layout/PublicSectionHeader";
import JsonLd from "@/components/seo/JsonLd";
import { generateItemListJsonLd, generateBreadcrumbJsonLd } from "@/lib/structured-data";
import { ARTICLES } from "@/data/articles";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hojyocame.jp";

export const metadata: Metadata = {
  title: "お役立ち記事",
  description:
    "防犯カメラ補助金の申請ガイド・業種別ノウハウ・採択率を上げるコツなど、HOJYO CAME がまとめた記事一覧。",
  alternates: { canonical: "/articles" },
};

const sorted = [...ARTICLES].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

export default function ArticlesIndex() {
  const jsonLdBlocks = [
    generateItemListJsonLd(
      sorted.map((a) => ({ name: a.title, url: `${SITE_URL}/articles/${a.slug}` })),
    ),
    generateBreadcrumbJsonLd([
      { name: "HOJYO CAME", url: SITE_URL },
      { name: "お役立ち記事", url: `${SITE_URL}/articles` },
    ]),
  ];

  return (
    <PublicPageLayout>
      <JsonLd data={jsonLdBlocks} id="jsonld-articles" />
      <PublicSectionHeader
        overline="Articles"
        title="お役立ち記事"
        sub="補助金申請の実務ノウハウ・業種別の活用ガイド"
        as="h1"
        titleClass="hc-headline"
        align="left"
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {sorted.map((a) => (
          <Link
            key={a.slug}
            href={`/articles/${a.slug}`}
            style={{
              display: "block",
              padding: "20px 24px",
              background: "var(--hc-white)",
              border: "1px solid var(--hc-border)",
              borderRadius: 10,
              textDecoration: "none",
              color: "var(--hc-text)",
              boxShadow: "var(--hc-shadow)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              {/* カテゴリバッジ — 緑系 */}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--hc-primary)",
                  background: "var(--hc-primary-light)",
                  padding: "2px 8px",
                  borderRadius: 4,
                }}
              >
                {a.category}
              </span>
              <span style={{ fontSize: 11, color: "var(--hc-text-muted)" }}>
                {a.publishedAt}
              </span>
            </div>

            <h2
              style={{
                fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: "var(--hc-navy)",
                margin: "0 0 8px",
                letterSpacing: "-0.02em",
                lineHeight: 1.3,
              }}
            >
              {a.title}
            </h2>

            <p
              style={{
                fontSize: 13,
                color: "var(--hc-text-muted)",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              {a.description}
            </p>
          </Link>
        ))}
      </div>
    </PublicPageLayout>
  );
}
