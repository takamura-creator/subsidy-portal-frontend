"use client";

const BASE_RATE = 33.4;
const BOOSTED_RATE = 66.8; // ~2x

export default function AdoptionRateCard() {
  const basePct = Math.round((BASE_RATE / 100) * 100);
  const boostedPct = Math.min(Math.round((BOOSTED_RATE / 100) * 100), 100);

  return (
    <div
      style={{
        background: "var(--hc-card-bg)",
        border: "1px solid var(--hc-border)",
        borderRadius: 10,
        padding: 16,
      }}
    >
      <h3
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 13,
          fontWeight: 700,
          color: "var(--hc-navy)",
          marginBottom: 14,
          margin: "0 0 14px",
        }}
      >
        加点数と採択率の関係
      </h3>

      {/* Row: 0 bonus items */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            color: "var(--hc-text-muted)",
            marginBottom: 4,
          }}
        >
          <span>加点0個</span>
          <span style={{ fontWeight: 600, color: "var(--hc-text)" }}>約{BASE_RATE}%</span>
        </div>
        <div
          style={{
            height: 8,
            borderRadius: 4,
            background: "var(--hc-border)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${basePct}%`,
              background: "var(--hc-text-muted)",
              borderRadius: 4,
              transition: "width 0.6s ease",
            }}
          />
        </div>
      </div>

      {/* Row: 4+ bonus items */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12,
            color: "var(--hc-text-muted)",
            marginBottom: 4,
          }}
        >
          <span>加点4個以上</span>
          <span style={{ fontWeight: 700, color: "var(--hc-success)" }}>約2倍</span>
        </div>
        <div
          style={{
            height: 8,
            borderRadius: 4,
            background: "var(--hc-border)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${boostedPct}%`,
              background: "var(--hc-success)",
              borderRadius: 4,
              transition: "width 0.6s ease",
            }}
          />
        </div>
      </div>

      {/* Message */}
      <div
        style={{
          background: "var(--hc-primary-soft)",
          border: "1px solid var(--hc-primary-border)",
          borderRadius: 8,
          padding: "10px 12px",
          fontSize: 12,
          color: "var(--hc-navy)",
          fontWeight: 500,
          lineHeight: 1.5,
          textAlign: "center",
        }}
      >
        加点項目を増やすほど採択率が向上します
      </div>
    </div>
  );
}
