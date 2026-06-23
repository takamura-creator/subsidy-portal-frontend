import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { INDUSTRY_LPS } from "@/data/industry-lp";
import { getSubsidyById } from "@/lib/subsidies-server";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return INDUSTRY_LPS.map((lp) => ({ slug: lp.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lp = INDUSTRY_LPS.find((x) => x.slug === slug);
  if (!lp) return { title: "ページが見つかりません", robots: { index: false, follow: false } };
  return {
    title: `${lp.industry}向け 防犯カメラ補助金活用ガイド`,
    description: lp.hero.lead.slice(0, 120),
    alternates: { canonical: `/industries/${slug}` },
    robots: { index: true, follow: true },
  };
}

export default async function IndustryLPPage({ params }: Props) {
  const { slug } = await params;
  const lp = INDUSTRY_LPS.find((x) => x.slug === slug);
  if (!lp) notFound();

  const subsidies = lp.recommendedSubsidies
    .map((id) => getSubsidyById(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "32px 16px 48px" }}>
      <nav aria-label="パンくずリスト" style={{ fontSize: 12, color: "var(--hc-text-muted)", marginBottom: 12 }}>
        <Link href="/match" style={{ color: "var(--hc-text-muted)", textDecoration: "none" }}>
          業種選択
        </Link>
        <span style={{ margin: "0 6px" }}>›</span>
        <span>{lp.industry}</span>
      </nav>

      <header style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
            fontSize: 26,
            fontWeight: 700,
            color: "var(--hc-navy)",
            letterSpacing: "-0.5px",
            margin: "0 0 12px",
            lineHeight: 1.4,
          }}
        >
          {lp.hero.headline}
        </h1>
        <p style={{ fontSize: 14, color: "var(--hc-text-muted)", margin: 0, lineHeight: 1.8 }}>
          {lp.hero.lead}
        </p>
      </header>

      <Section title="設置のメリット">
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          {lp.benefits.map((b) => (
            <li key={b} style={{ marginBottom: 4 }}>
              {b}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="想定リスク（こんなお悩みはありませんか？）">
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          {lp.risks.map((r) => (
            <li key={r} style={{ marginBottom: 4 }}>
              {r}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="活用できる補助金">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {subsidies.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--hc-text-muted)", margin: 0 }}>
              該当補助金は準備中です。お問い合わせください。
            </p>
          ) : (
            subsidies.map((s) => (
              <Link
                key={s.id}
                href={`/subsidies/${s.id}`}
                style={{
                  display: "block",
                  padding: 14,
                  background: "var(--hc-card-bg)",
                  border: "1px solid var(--hc-border)",
                  borderRadius: 8,
                  textDecoration: "none",
                  color: "var(--hc-text)",
                }}
              >
                <strong style={{ fontSize: 14, color: "var(--hc-navy)" }}>{s.name}</strong>
                <span style={{ fontSize: 12, color: "var(--hc-text-muted)", marginLeft: 8 }}>
                  最大 {s.max_amount.toLocaleString()}円{s.rate_max != null ? ` / 補助率 ${Math.round(s.rate_max * 100)}%` : ""}
                </span>
              </Link>
            ))
          )}
        </div>
      </Section>

      <section
        style={{
          marginTop: 32,
          padding: 20,
          background: "linear-gradient(135deg, var(--hc-primary-faint) 0%, var(--hc-accent-light) 100%)",
          border: "1px solid var(--hc-primary-edge)",
          borderRadius: 10,
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--hc-navy)", margin: "0 0 6px" }}>
          {lp.industry}での施工はマルチックにご相談ください
        </p>
        <p style={{ fontSize: 12, color: "var(--hc-text-muted)", margin: "0 0 14px" }}>
          東京都・神奈川県・静岡県・埼玉県・千葉県・山梨県の6都県で直接施工対応
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
          相談する →
        </Link>
      </section>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <h2
        style={{
          fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
          fontSize: 18,
          fontWeight: 700,
          color: "var(--hc-navy)",
          margin: "0 0 8px",
          letterSpacing: "-0.3px",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
