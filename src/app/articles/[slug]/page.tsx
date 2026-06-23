import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import PublicPageLayout from "@/components/layout/PublicPageLayout";
import { ARTICLES } from "@/data/articles";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = ARTICLES.find((x) => x.slug === slug);
  if (!a) return { title: "記事が見つかりません", robots: { index: false, follow: false } };
  return {
    title: a.title,
    description: a.description,
    alternates: { canonical: `/articles/${slug}` },
    robots: { index: true, follow: true },
    openGraph: { type: "article", title: a.title, description: a.description },
  };
}

/** 簡易 Markdown レンダラ（h2 / p / ul / ol / strong 対応） */
function renderMarkdown(md: string): React.ReactNode[] {
  const blocks = md.split(/\n\n+/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();

    if (trimmed.startsWith("## ")) {
      return (
        <h2
          key={i}
          style={{
            fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
            fontSize: 22,
            fontWeight: 700,
            color: "var(--hc-navy)",
            margin: "32px 0 10px",
            letterSpacing: "-0.02em",
            lineHeight: 1.3,
          }}
        >
          {trimmed.slice(3)}
        </h2>
      );
    }

    if (trimmed.startsWith("---")) {
      return (
        <hr
          key={i}
          style={{ border: "none", borderTop: "1px solid var(--hc-border)", margin: "28px 0" }}
        />
      );
    }

    if (/^\d+\.\s/.test(trimmed)) {
      const lines = trimmed.split("\n").filter(Boolean);
      return (
        <ol key={i} style={{ margin: "10px 0", paddingLeft: 22, lineHeight: 1.8 }}>
          {lines.map((line, j) => (
            <li key={j} style={{ marginBottom: 6 }}>
              {renderInline(line.replace(/^\d+\.\s/, ""))}
            </li>
          ))}
        </ol>
      );
    }

    if (trimmed.startsWith("- ")) {
      const lines = trimmed.split("\n").filter(Boolean);
      return (
        <ul key={i} style={{ margin: "10px 0", paddingLeft: 22, lineHeight: 1.8 }}>
          {lines.map((line, j) => (
            <li key={j} style={{ marginBottom: 6 }}>
              {renderInline(line.replace(/^- /, ""))}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={i} style={{ margin: "10px 0", lineHeight: 1.8 }}>
        {renderInline(trimmed)}
      </p>
    );
  });
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} style={{ fontWeight: 700, color: "var(--hc-navy)" }}>
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const a = ARTICLES.find((x) => x.slug === slug);
  if (!a) notFound();

  return (
    <PublicPageLayout>
    <div
      style={{
        maxWidth: 760,
        fontFamily: "'Noto Sans JP', sans-serif",
        color: "var(--hc-text)",
        fontSize: 16,
      }}
    >
      {/* パンくず */}
      <nav
        aria-label="パンくずリスト"
        style={{ fontSize: 12, color: "var(--hc-text-muted)", marginBottom: 24 }}
      >
        <Link
          href="/articles"
          style={{ color: "var(--hc-text-muted)", textDecoration: "none" }}
        >
          お役立ち記事
        </Link>
        <span style={{ margin: "0 6px" }}>›</span>
        <span>{a.title}</span>
      </nav>

      {/* 記事ヘッダー */}
      <header style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
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
          <span style={{ fontSize: 11, color: "var(--hc-text-muted)" }}>{a.publishedAt}</span>
        </div>

        {/* h1 — Headline 級 */}
        <h1
          style={{
            fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
            fontSize: "clamp(22px, 3vw, 32px)",
            fontWeight: 700,
            color: "var(--hc-navy)",
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
            margin: "0 0 12px",
          }}
        >
          {a.title}
        </h1>

        <p style={{ fontSize: 15, color: "var(--hc-text-muted)", margin: 0, lineHeight: 1.7 }}>
          {a.description}
        </p>
      </header>

      {/* 本文 — Body 16px */}
      <article style={{ lineHeight: 1.85, fontSize: 16 }}>
        {renderMarkdown(a.body)}
      </article>

      {/* CTA — プライマリ1本 */}
      <section
        style={{
          marginTop: 48,
          padding: 24,
          background: "var(--hc-primary-faint)",
          border: "1px solid var(--hc-primary-edge)",
          borderRadius: 10,
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--hc-navy)",
            margin: "0 0 12px",
            fontFamily: "'Noto Sans JP', sans-serif",
          }}
        >
          補助金申請・施工のご相談はマルチックまで
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
          相談する →
        </Link>
      </section>
    </div>
    </PublicPageLayout>
  );
}
