import type { Metadata } from "next";
import Link from "next/link";
import { ARTICLES } from "@/data/articles";

export const metadata: Metadata = {
  title: "お役立ち記事",
  description:
    "防犯カメラ補助金の申請ガイド・業種別ノウハウ・採択率を上げるコツなど、HOJYO CAME がまとめた記事一覧。",
  alternates: { canonical: "/articles" },
};

const sorted = [...ARTICLES].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

export default function ArticlesIndex() {
  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "32px 16px 48px" }}>
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
          お役立ち記事
        </h1>
        <p style={{ fontSize: 14, color: "var(--hc-text-muted)", margin: 0 }}>
          補助金申請の実務ノウハウ・業種別の活用ガイド
        </p>
      </header>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sorted.map((a) => (
          <Link
            key={a.slug}
            href={`/articles/${a.slug}`}
            style={{
              display: "block",
              padding: 16,
              background: "linear-gradient(168deg, color-mix(in srgb, var(--hc-primary) 4%, var(--hc-white)) 0%, var(--hc-bg) 55%, color-mix(in srgb, var(--hc-accent) 6%, var(--hc-bg)) 100%)",
              border: "1px solid var(--hc-border)",
              borderRadius: 10,
              textDecoration: "none",
              color: "var(--hc-text)",
              boxShadow: "var(--hc-shadow)",
            }}
          >
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
            <h2
              style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 16,
                fontWeight: 700,
                color: "var(--hc-navy)",
                margin: "8px 0 4px",
              }}
            >
              {a.title}
            </h2>
            <p style={{ fontSize: 13, color: "var(--hc-text-muted)", margin: 0, lineHeight: 1.6 }}>
              {a.description}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
