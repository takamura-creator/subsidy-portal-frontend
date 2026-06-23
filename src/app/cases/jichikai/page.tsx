import type { Metadata } from "next";
import Link from "next/link";
import PublicPageLayout from "@/components/layout/PublicPageLayout";
import PublicSectionHeader from "@/components/layout/PublicSectionHeader";
import { JICHIKAI_CASES } from "@/data/cases-jichikai";

export const metadata: Metadata = {
  title: "自治会向け防犯カメラ施工事例",
  description:
    "藤沢市鵠沼地区など湘南エリアでの自治会向け防犯カメラ設置事例。補助金活用・自己負担・設置台数まで詳細に公開しています。",
  alternates: { canonical: "/cases/jichikai" },
};

export default function JichikaiCasesIndex() {
  return (
    <PublicPageLayout>
      <PublicSectionHeader
        overline="Cases — 自治会"
        title="自治会向け防犯カメラ施工事例"
        sub="湘南エリア 9 件の施工実績の中から代表事例を公開しています。"
        as="h1"
        titleClass="hc-headline"
        align="left"
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 24,
        }}
      >
        {JICHIKAI_CASES.map((c, idx) => (
          <Link
            key={c.slug}
            href={`/cases/jichikai/${c.slug}`}
            style={{
              display: "block",
              background: "var(--hc-white)",
              border: "1px solid var(--hc-border)",
              borderRadius: 10,
              padding: "24px 20px",
              textDecoration: "none",
              color: "var(--hc-text)",
              boxShadow: "var(--hc-shadow)",
              transition: "box-shadow 0.2s",
            }}
          >
            {/* 番号バッジ（絵文字bgIconの代替） */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--hc-primary-soft)",
                color: "var(--hc-primary)",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
                marginBottom: 12,
              }}
            >
              {String(idx + 1).padStart(2, "0")}
            </div>

            <h2
              style={{
                fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: "var(--hc-navy)",
                margin: "0 0 6px",
                letterSpacing: "-0.02em",
              }}
            >
              {c.area}
            </h2>

            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--hc-primary)",
                margin: "0 0 4px",
              }}
            >
              {c.cameraCount}台設置
            </p>

            <p
              style={{
                fontSize: 12,
                color: "var(--hc-text-muted)",
                margin: "0 0 8px",
                lineHeight: 1.6,
              }}
            >
              {c.subsidy}
            </p>

            <p
              style={{
                fontSize: 12,
                color: "var(--hc-text-muted)",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              自己負担: {c.selfPayment.toLocaleString()}円 ／ {c.installedAt}
            </p>
          </Link>
        ))}
      </div>
    </PublicPageLayout>
  );
}
