"use client";

interface Props {
  industry: string;
  icon: string;
  desc: string;
  count: number;
  onSelect: (industry: string) => void;
}

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
      }}
    >
      <article
        className="hc-industry-card"
        style={{
          borderRadius: 10,
          padding: 16,
          cursor: "pointer",
          height: "100%",
          minHeight: 156,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <h2
          style={{
            fontSize: 16,
            fontWeight: 700,
            margin: "0 0 4px",
            color: "var(--hc-navy)",
            fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
            letterSpacing: "-0.3px",
          }}
        >
          {industry}
        </h2>
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
        <div
          style={{
            fontSize: 12,
            fontWeight: 500,
            marginTop: 8,
            color: count > 0 ? "var(--hc-primary)" : "var(--hc-text-muted)",
          }}
        >
          {count > 0 ? `補助金 ${count}件 →` : "情報準備中"}
        </div>
      </article>
    </button>
  );
}
