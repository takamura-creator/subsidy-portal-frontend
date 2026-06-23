import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import PublicPageLayout from "@/components/layout/PublicPageLayout";
import InfoTable from "@/components/shared/InfoTable";
import { JICHIKAI_CASES } from "@/data/cases-jichikai";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return JICHIKAI_CASES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = JICHIKAI_CASES.find((x) => x.slug === slug);
  if (!c) {
    return { title: "事例が見つかりません", robots: { index: false, follow: false } };
  }
  return {
    title: `${c.area}での自治会向け防犯カメラ設置事例（${c.cameraCount}台）`,
    description: `${c.district}・${c.area}における自治会向け防犯カメラ設置事例。${c.subsidy}を活用、自己負担${c.selfPayment.toLocaleString()}円で${c.cameraCount}台設置。`,
    alternates: { canonical: `/cases/jichikai/${slug}` },
    robots: { index: true, follow: true },
  };
}

const PROSE_STYLE: React.CSSProperties = {
  fontFamily: "'Noto Sans JP', sans-serif",
  color: "var(--hc-text)",
  lineHeight: 1.8,
  fontSize: 15,
  maxWidth: 760,
};

const SECTION_H2: React.CSSProperties = {
  fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
  fontSize: 20,
  fontWeight: 700,
  color: "var(--hc-navy)",
  margin: "0 0 12px",
  letterSpacing: "-0.02em",
};

export default async function CasePage({ params }: Props) {
  const { slug } = await params;
  const c = JICHIKAI_CASES.find((x) => x.slug === slug);
  if (!c) notFound();

  const caseRows = [
    { label: "補助金", value: c.subsidy },
    { label: "補助金額", value: `${c.subsidyAmount.toLocaleString()}円` },
    { label: "自己負担額", value: `${c.selfPayment.toLocaleString()}円` },
    { label: "設置台数", value: `${c.cameraCount}台` },
  ];

  // 一覧での表示順を再現するためにインデックスを取得
  const caseIdx = JICHIKAI_CASES.findIndex((x) => x.slug === slug);

  return (
    <PublicPageLayout>
      <div style={PROSE_STYLE}>
      {/* パンくず */}
      <nav
        aria-label="パンくずリスト"
        style={{ fontSize: 12, color: "var(--hc-text-muted)", marginBottom: 24 }}
      >
        <Link
          href="/cases"
          style={{ color: "var(--hc-text-muted)", textDecoration: "none" }}
        >
          施工事例
        </Link>
        <span style={{ margin: "0 6px" }}>›</span>
        <Link
          href="/cases/jichikai"
          style={{ color: "var(--hc-text-muted)", textDecoration: "none" }}
        >
          自治会向け
        </Link>
        <span style={{ margin: "0 6px" }}>›</span>
        <span>{c.area}</span>
      </nav>

      {/* ヘッダー */}
      <header style={{ marginBottom: 32 }}>
        {/* #7: 数字バッジ（一覧と統一） */}
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
          {String(caseIdx >= 0 ? caseIdx + 1 : 1).padStart(2, "0")}
        </div>
        <h1
          style={{
            fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
            fontSize: "clamp(22px, 3vw, 32px)",
            fontWeight: 700,
            color: "var(--hc-navy)",
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
            margin: "0 0 8px",
          }}
        >
          {c.area}・自治会向け防犯カメラ {c.cameraCount}台 設置事例
        </h1>
        <p style={{ fontSize: 13, color: "var(--hc-text-muted)", margin: 0 }}>
          {c.district} ／ 設置時期: {c.installedAt}
        </p>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        {/* 費用サマリ — InfoTable */}
        <section>
          <h2 style={SECTION_H2}>活用補助金と費用</h2>
          <InfoTable rows={caseRows} />
        </section>

        {/* 設置概要 */}
        <section>
          <h2 style={SECTION_H2}>設置の概要</h2>
          <p style={{ margin: 0 }}>{c.description}</p>
        </section>

        {/* 効果 */}
        <section>
          <h2 style={SECTION_H2}>設置後の効果</h2>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {c.effects.map((e) => (
              <li key={e} style={{ marginBottom: 6 }}>
                {e}
              </li>
            ))}
          </ul>
        </section>

        {/* CTA — accent-light廃止・primary-faint単色に */}
        <section
          style={{
            padding: 24,
            borderRadius: 10,
            background: "var(--hc-primary-faint)",
            border: "1px solid var(--hc-primary-edge)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "var(--hc-navy)",
              margin: "0 0 6px",
              fontFamily: "'Noto Sans JP', sans-serif",
            }}
          >
            同地区での施工実績多数。同じような構成・予算規模でのご相談を承ります。
          </p>
          <p
            style={{
              fontSize: 12,
              color: "var(--hc-text-muted)",
              margin: "0 0 16px",
              lineHeight: 1.6,
            }}
          >
            藤沢市鵠沼地区 9件の施工実績／湘南エリアでの対応経験豊富
          </p>
          <Link
            href="/contact"
            style={{
              display: "inline-block",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--hc-white)",
              background: "var(--hc-primary)",
              padding: "12px 28px",
              borderRadius: 8,
              textDecoration: "none",
              fontFamily: "'Noto Sans JP', sans-serif",
            }}
          >
            マルチックに相談する →
          </Link>
        </section>
      </div>
      </div>
    </PublicPageLayout>
  );
}
