import type { Metadata } from "next";
import Link from "next/link";
import { JICHIKAI_CASES } from "@/data/cases-jichikai";

export const metadata: Metadata = {
  title: "自治会向け防犯カメラ施工事例",
  description:
    "藤沢市鵠沼地区など湘南エリアでの自治会向け防犯カメラ設置事例。補助金活用・自己負担・設置台数まで詳細に公開しています。",
  alternates: { canonical: "/cases/jichikai" },
};

export default function JichikaiCasesIndex() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "32px 16px 48px" }}>
      <header style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 24,
            fontWeight: 700,
            color: "var(--hc-navy)",
            letterSpacing: "-0.5px",
            margin: "0 0 6px",
          }}
        >
          自治会向け防犯カメラ施工事例
        </h1>
        <p style={{ fontSize: 14, color: "var(--hc-text-muted)", margin: 0 }}>
          湘南エリア 9 件の施工実績の中から代表事例を公開
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}
      >
        {JICHIKAI_CASES.map((c) => (
          <Link
            key={c.slug}
            href={`/cases/jichikai/${c.slug}`}
            style={{
              display: "block",
              background: "var(--hc-white)",
              border: "1px solid var(--hc-border)",
              borderRadius: 10,
              padding: 20,
              textDecoration: "none",
              color: "var(--hc-text)",
              boxShadow: "var(--hc-shadow)",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 8, lineHeight: 1 }}>{c.bgIcon}</div>
            <h2
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 16,
                fontWeight: 700,
                color: "var(--hc-navy)",
                margin: "0 0 6px",
              }}
            >
              {c.area} {c.cameraCount}台
            </h2>
            <p style={{ fontSize: 12, color: "var(--hc-text-muted)", margin: "0 0 8px", lineHeight: 1.6 }}>
              {c.subsidy}
            </p>
            <p style={{ fontSize: 12, color: "var(--hc-text-muted)", margin: 0, lineHeight: 1.6 }}>
              自己負担: {c.selfPayment.toLocaleString()}円 / 設置時期: {c.installedAt}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
