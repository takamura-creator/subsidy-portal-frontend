"use client";

interface Props {
  industry: string;
  icon: string;
  desc: string;
  count: number;
  onSelect: (industry: string) => void;
}

/**
 * IndustryCard v2 — 業種カード
 * 見出し 22px / 絵文字は控えめサイズ（20px）/ 緑単一アクセント / 装飾なし
 */
export default function IndustryCard({ industry, icon, desc, count, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(industry)}
      style={{
        color: "inherit",
        display: "block",
        width: "100%",
        textAlign: "left",
        border: "none",
        background: "transparent",
        padding: 0,
        fontFamily: "inherit",
        cursor: "pointer",
      }}
    >
      <article
        className="hc-industry-card"
        style={{
          borderRadius: 10,
          padding: "20px 18px",
          height: "100%",
          minHeight: 140,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {/* 絵文字アイコン — 控えめサイズ */}
        <span
          aria-hidden="true"
          style={{
            fontSize: 20,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          {icon}
        </span>

        {/* 業種名 */}
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            margin: 0,
            color: "var(--hc-navy)",
            fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          {industry}
        </h2>

        {/* 説明文 */}
        <p
          style={{
            fontSize: 13,
            color: "var(--hc-text-muted)",
            margin: 0,
            lineHeight: 1.6,
            flex: 1,
          }}
        >
          {desc}
        </p>

        {/* 件数バッジ — 緑アクセントのみ */}
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: count > 0 ? "var(--hc-primary)" : "var(--hc-text-muted)",
            marginTop: 4,
          }}
        >
          {count > 0 ? `補助金 ${count}件 →` : "情報準備中"}
        </div>
      </article>
    </button>
  );
}
