import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
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

export default async function CasePage({ params }: Props) {
  const { slug } = await params;
  const c = JICHIKAI_CASES.find((x) => x.slug === slug);
  if (!c) notFound();

  return (
    <main
      style={{
        maxWidth: 820,
        margin: "0 auto",
        padding: "32px 16px 64px",
        fontFamily: "'Noto Sans JP', sans-serif",
        color: "var(--hc-text)",
        lineHeight: 1.8,
        fontSize: 14,
      }}
    >
      <nav aria-label="パンくずリスト" style={{ fontSize: 12, color: "var(--hc-text-muted)", marginBottom: 12 }}>
        <Link href="/cases" style={{ color: "var(--hc-text-muted)", textDecoration: "none" }}>
          施工事例
        </Link>
        <span style={{ margin: "0 6px" }}>›</span>
        <Link href="/cases/jichikai" style={{ color: "var(--hc-text-muted)", textDecoration: "none" }}>
          自治会向け
        </Link>
        <span style={{ margin: "0 6px" }}>›</span>
        <span>{c.area}</span>
      </nav>

      <header style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>{c.bgIcon}</div>
        <h1
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 26,
            fontWeight: 700,
            color: "var(--hc-navy)",
            letterSpacing: "-0.5px",
            margin: "0 0 6px",
          }}
        >
          {c.area}・自治会向け防犯カメラ {c.cameraCount}台 設置事例
        </h1>
        <p style={{ fontSize: 13, color: "var(--hc-text-muted)", margin: 0 }}>
          {c.district} ／ 設置時期: {c.installedAt}
        </p>
      </header>

      <section
        style={{
          padding: 16,
          background: "var(--hc-primary-faint)",
          border: "1px solid var(--hc-primary-edge)",
          borderRadius: 10,
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px", color: "var(--hc-navy)" }}>
          活用補助金と費用
        </h2>
        <dl style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: "4px 16px", fontSize: 13, margin: 0 }}>
          <dt>補助金</dt>
          <dd style={{ margin: 0 }}>{c.subsidy}</dd>
          <dt>補助金額</dt>
          <dd style={{ margin: 0 }}>{c.subsidyAmount.toLocaleString()}円</dd>
          <dt>自己負担額</dt>
          <dd style={{ margin: 0 }}>{c.selfPayment.toLocaleString()}円</dd>
          <dt>設置台数</dt>
          <dd style={{ margin: 0 }}>{c.cameraCount}台</dd>
        </dl>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 18,
            fontWeight: 700,
            color: "var(--hc-navy)",
            margin: "0 0 8px",
          }}
        >
          設置の概要
        </h2>
        <p style={{ margin: 0 }}>{c.description}</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 18,
            fontWeight: 700,
            color: "var(--hc-navy)",
            margin: "0 0 8px",
          }}
        >
          設置後の効果
        </h2>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {c.effects.map((e) => (
            <li key={e} style={{ marginBottom: 4 }}>
              {e}
            </li>
          ))}
        </ul>
      </section>

      <section
        style={{
          padding: 20,
          borderRadius: 10,
          background: "linear-gradient(135deg, var(--hc-primary-faint) 0%, var(--hc-accent-light) 100%)",
          border: "1px solid var(--hc-primary-edge)",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--hc-navy)", margin: "0 0 6px" }}>
          同地区での施工実績多数。同じような構成・予算規模でのご相談を承ります。
        </p>
        <p style={{ fontSize: 12, color: "var(--hc-text-muted)", margin: "0 0 14px" }}>
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
          }}
        >
          マルチックに相談する →
        </Link>
      </section>
    </main>
  );
}
