import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
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

/** 簡易 Markdown レンダラ（h2 / p / ul / strong のみ対応） */
function renderMarkdown(md: string): React.ReactNode[] {
  const blocks = md.split(/\n\n+/);
  return blocks.map((block, i) => {
    const trimmed = block.trim();
    if (trimmed.startsWith("## ")) {
      return (
        <h2
          key={i}
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 18,
            fontWeight: 700,
            color: "var(--hc-navy)",
            margin: "20px 0 8px",
            letterSpacing: "-0.3px",
          }}
        >
          {trimmed.slice(3)}
        </h2>
      );
    }
    if (trimmed.startsWith("---")) {
      return <hr key={i} style={{ border: "none", borderTop: "1px solid var(--hc-border)", margin: "24px 0" }} />;
    }
    if (/^\d+\.\s/.test(trimmed)) {
      const lines = trimmed.split("\n").filter(Boolean);
      return (
        <ol key={i} style={{ margin: "8px 0", paddingLeft: 20 }}>
          {lines.map((line, j) => (
            <li key={j} style={{ marginBottom: 4 }}>{renderInline(line.replace(/^\d+\.\s/, ""))}</li>
          ))}
        </ol>
      );
    }
    if (trimmed.startsWith("- ")) {
      const lines = trimmed.split("\n").filter(Boolean);
      return (
        <ul key={i} style={{ margin: "8px 0", paddingLeft: 20 }}>
          {lines.map((line, j) => (
            <li key={j} style={{ marginBottom: 4 }}>{renderInline(line.replace(/^- /, ""))}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} style={{ margin: "8px 0" }}>
        {renderInline(trimmed)}
      </p>
    );
  });
}

function renderInline(text: string): React.ReactNode {
  // **bold** のみ対応
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
    <main
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "32px 16px 48px",
        fontFamily: "'Noto Sans JP', sans-serif",
        color: "var(--hc-text)",
        lineHeight: 1.8,
        fontSize: 14,
      }}
    >
      <nav style={{ fontSize: 12, color: "var(--hc-text-muted)", marginBottom: 12 }}>
        <Link href="/articles" style={{ color: "var(--hc-text-muted)", textDecoration: "none" }}>
          お役立ち記事
        </Link>
        <span style={{ margin: "0 6px" }}>›</span>
        <span>{a.title}</span>
      </nav>

      <header style={{ marginBottom: 16 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--hc-primary)",
            background: "var(--hc-primary-light)",
            padding: "2px 8px",
            borderRadius: 4,
            marginRight: 8,
          }}
        >
          {a.category}
        </span>
        <span style={{ fontSize: 11, color: "var(--hc-text-muted)" }}>{a.publishedAt}</span>
        <h1
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 24,
            fontWeight: 800,
            color: "var(--hc-navy)",
            letterSpacing: "-0.5px",
            margin: "10px 0 6px",
          }}
        >
          {a.title}
        </h1>
        <p style={{ fontSize: 13, color: "var(--hc-text-muted)", margin: 0 }}>{a.description}</p>
      </header>

      <article>{renderMarkdown(a.body)}</article>

      <section
        style={{
          marginTop: 32,
          padding: 18,
          background: "var(--hc-primary-faint)",
          border: "1px solid var(--hc-primary-edge)",
          borderRadius: 10,
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--hc-navy)", margin: "0 0 10px" }}>
          補助金申請・施工のご相談はマルチックまで
        </p>
        <Link
          href="/contact"
          style={{
            display: "inline-block",
            fontSize: 13,
            fontWeight: 700,
            color: "var(--hc-white)",
            background: "var(--hc-primary)",
            padding: "10px 22px",
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
