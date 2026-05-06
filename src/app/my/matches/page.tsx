"use client";

import { useState } from "react";
import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";

const DATE_FILTERS = [
  { key: "all", label: "すべて" },
  { key: "30d", label: "過去30日" },
  { key: "90d", label: "過去90日" },
];

export default function MyMatchesPage() {
  const [dateFilter, setDateFilter] = useState("all");

  // --- 左パネル ---
  const leftPanel = (
    <div>
      <span className="section-title">期間</span>
      <select
        className="form-select"
        value={dateFilter}
        onChange={(e) => setDateFilter(e.target.value)}
        style={{ width: "100%", padding: "8px 10px", fontSize: 13, marginTop: 8 }}
      >
        {DATE_FILTERS.map((f) => (
          <option key={f.key} value={f.key}>{f.label}</option>
        ))}
      </select>
    </div>
  );

  // --- 右パネル ---
  const rightPanel = (
    <div>
      <span className="section-title">比較</span>
      <div
        style={{
          marginTop: 12,
          padding: "20px 12px",
          textAlign: "center",
          color: "var(--hc-text-muted)",
          fontSize: 11,
          background: "var(--hc-white)",
          border: "1px solid var(--hc-border)",
          borderRadius: 8,
        }}
      >
        診断を実行すると<br />比較が表示されます
      </div>
    </div>
  );

  // --- 中央コンテンツ ---
  const centerContent = (
    <>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--hc-navy)", marginBottom: 16 }}>
        マッチング履歴
      </h1>

      <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--hc-text-muted)", fontSize: 13 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
        マッチング履歴がありません
        <div style={{ marginTop: 12 }}>
          <Link href="/match" className="btn-primary" style={{ fontSize: 12, padding: "8px 16px", width: "auto", display: "inline-block" }}>
            AI診断を受ける
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <ThreeColumnLayout
      left={leftPanel}
      center={centerContent}
      right={rightPanel}
      gridCols="200px 1fr 260px"
    />
  );
}
