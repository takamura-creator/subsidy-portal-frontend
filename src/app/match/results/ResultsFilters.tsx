"use client";

import Link from "next/link";

interface Condition {
  label: string;
  value: string;
}

const FILTERS: { label: string; options: string[] }[] = [
  { label: "マッチスコア", options: ["すべて", "高のみ", "中以上"] },
  { label: "補助上限額", options: ["すべて", "〜50万円", "〜100万円", "500万円以上"] },
  { label: "締切", options: ["すべて", "30日以内", "60日以内"] },
];

export default function ResultsFilters({ conditions }: { conditions: Condition[] }) {
  return (
    <div>
      <span className="section-title">絞り込み</span>

      {FILTERS.map(({ label, options }) => (
        <div key={label} style={{ marginBottom: 14 }}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 600,
              color: "var(--hc-text)",
              marginBottom: 4,
            }}
          >
            {label}
          </label>
          <select className="form-select" style={{ fontSize: 13, padding: "8px 10px" }}>
            {options.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      ))}

      <div className="divider" />

      <span className="section-title">診断条件</span>

      <div
        style={{
          background: "var(--hc-card-bg)",
          border: "1px solid var(--hc-border)",
          borderRadius: 8,
          padding: 12,
          marginTop: 12,
        }}
      >
        <h3
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--hc-navy)",
            marginBottom: 8,
            fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
          }}
        >
          入力内容
        </h3>
        {conditions.map(({ label, value }) => (
          <div
            key={label}
            style={{
              fontSize: 12,
              color: "var(--hc-text-muted)",
              padding: "4px 0",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{label}</span>
            <span style={{ fontWeight: 500, color: "var(--hc-text)" }}>{value}</span>
          </div>
        ))}
        <Link
          href="/match"
          style={{
            fontSize: 11,
            color: "var(--hc-primary)",
            textDecoration: "none",
            display: "block",
            marginTop: 8,
          }}
        >
          条件を変更する
        </Link>
      </div>
    </div>
  );
}
