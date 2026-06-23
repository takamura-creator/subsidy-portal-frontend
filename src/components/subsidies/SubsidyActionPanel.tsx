"use client";

/**
 * 補助金詳細ページ右カラム（アクション + 補助金情報）
 * SubsidyDetailClient から抽出。
 */

import Link from "next/link";
import type { Subsidy } from "@/lib/api";
import { formatAmount } from "@/lib/subsidyFormatters";

interface SubsidyActionPanelProps {
  subsidy: Subsidy;
}

export default function SubsidyActionPanel({ subsidy: s }: SubsidyActionPanelProps) {
  return (
    <div>
      <span className="section-title">アクション</span>

      {/* Primary: 申請書作成 */}
      <Link
        href={`/my/wizard?subsidy_id=${s.id}`}
        style={{
          display: "block",
          width: "100%",
          padding: 12,
          marginBottom: 8,
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 700,
          textAlign: "center",
          cursor: "pointer",
          fontFamily: "inherit",
          textDecoration: "none",
          border: "2px solid var(--hc-primary)",
          background: "var(--hc-primary)",
          color: "var(--hc-white)",
          transition: "all 0.3s",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = "var(--hc-white)";
          e.currentTarget.style.color = "var(--hc-primary)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "var(--hc-primary)";
          e.currentTarget.style.color = "var(--hc-white)";
        }}
      >
        この補助金で申請書を作成
      </Link>

      {/* Secondary: 施工パートナー */}
      <Link
        href="/partners/multik"
        style={{
          display: "block",
          width: "100%",
          padding: 12,
          marginBottom: 8,
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 700,
          textAlign: "center",
          cursor: "pointer",
          fontFamily: "inherit",
          textDecoration: "none",
          border: "2px solid var(--hc-primary)",
          background: "var(--hc-card-bg)",
          color: "var(--hc-primary)",
          transition: "all 0.3s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = "var(--hc-primary-subtle)")}
        onMouseOut={(e) => (e.currentTarget.style.background = "var(--hc-white)")}
      >
        施工パートナーを見る
      </Link>

      {/* Info box */}
      <div style={{
        background: "var(--hc-card-bg)",
        border: "1px solid var(--hc-border)",
        borderRadius: 8,
        padding: 16,
        marginTop: 12,
      }}>
        <h3 style={{
          fontSize: 13,
          fontWeight: 700,
          color: "var(--hc-navy)",
          marginBottom: 8,
          fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
        }}>
          補助金情報
        </h3>
        {[
          ["管轄", s.ministry],
          ["カテゴリ", s.category],
          ["地域", s.prefecture],
          ["データID", s.id],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              borderBottom: "1px solid var(--hc-border)",
              fontSize: 12,
            }}
          >
            <span style={{ color: "var(--hc-text-muted)" }}>{label}</span>
            <span style={{ fontWeight: 600, color: "var(--hc-text)" }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
