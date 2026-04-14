"use client";

import { useState } from "react";
import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import MySidebar from "@/components/my/MySidebar";

// --- 型定義 ---
interface MatchRecord {
  id: string;
  date: string;
  condition: string;
  count: number;
  topScore: number;
  purpose: string;
  matches: { name: string; score: number }[];
}

// --- モックデータ ---
const MOCK_MATCHES: MatchRecord[] = [
  {
    id: "m1",
    date: "2026/4/13 09:30",
    condition: "小売業 / 6-20名 / 東京都 / 防犯対策",
    count: 5,
    topScore: 92,
    purpose: "防犯対策",
    matches: [
      { name: "IT導入補助金 2026", score: 92 },
      { name: "東京都 防犯設備設置費助成", score: 88 },
      { name: "小規模事業者持続化補助金", score: 75 },
      { name: "ものづくり補助金", score: 60 },
      { name: "事業再構築補助金", score: 55 },
    ],
  },
  {
    id: "m2",
    date: "2026/4/5 14:20",
    condition: "小売業 / 6-20名 / 東京都 / 入退場管理",
    count: 3,
    topScore: 78,
    purpose: "入退場管理",
    matches: [
      { name: "IT導入補助金 2026", score: 78 },
      { name: "小規模事業者持続化補助金", score: 65 },
      { name: "ものづくり補助金", score: 50 },
    ],
  },
  {
    id: "m3",
    date: "2026/3/20 11:00",
    condition: "小売業 / 1-5名 / 東京都 / 防犯対策",
    count: 4,
    topScore: 83,
    purpose: "防犯対策",
    matches: [
      { name: "東京都 防犯設備設置費助成", score: 83 },
      { name: "IT導入補助金 2026", score: 70 },
      { name: "小規模事業者持続化補助金", score: 62 },
      { name: "ものづくり補助金", score: 45 },
    ],
  },
];

const DATE_FILTERS = [
  { key: "all", label: "すべて" },
  { key: "30d", label: "過去30日" },
  { key: "90d", label: "過去90日" },
];

export default function MyMatchesPage() {
  const [matches] = useState<MatchRecord[]>(MOCK_MATCHES);
  const [selected, setSelected] = useState<MatchRecord>(MOCK_MATCHES[0]);
  const [compareWith] = useState<MatchRecord | null>(MOCK_MATCHES[1]);
  const [dateFilter, setDateFilter] = useState("all");

  function handleSelect(m: MatchRecord) {
    setSelected(m);
  }

  // --- 左パネル ---
  const leftPanel = (
    <div>
      <MySidebar active="/my/matches" counts={{ matches: 3 }} />
      <div className="divider" />
      <span className="section-title">期間</span>
      <select
        className="form-select"
        value={dateFilter}
        onChange={(e) => setDateFilter(e.target.value)}
        style={{ width: "100%", padding: "8px 10px", fontSize: 13 }}
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

      {compareWith && (
        <div
          style={{
            background: "var(--hc-white)",
            border: "1px solid var(--hc-border)",
            borderRadius: 8,
            padding: 14,
          }}
        >
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 10 }}>
            2回の診断結果を比較
          </h3>
          {/* ヘッダー */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, padding: "6px 0", borderBottom: "1px solid var(--hc-border)", fontSize: 11 }}>
            <span style={{ fontWeight: 600, color: "var(--hc-navy)" }}>
              {selected.date.slice(5, 10)}
            </span>
            <span style={{ fontWeight: 600, color: "var(--hc-navy)" }}>
              {compareWith.date.slice(5, 10)}
            </span>
          </div>
          {/* マッチ数 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, padding: "6px 0", borderBottom: "1px solid var(--hc-border)", fontSize: 11 }}>
            <span>{selected.count}件マッチ</span>
            <span>{compareWith.count}件マッチ</span>
          </div>
          {/* 目的 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, padding: "6px 0", borderBottom: "1px solid var(--hc-border)", fontSize: 11 }}>
            <span>{selected.purpose}</span>
            <span>{compareWith.purpose}</span>
          </div>
          {/* 最高スコア */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, padding: "6px 0", fontSize: 11 }}>
            <span>最高{selected.topScore}%</span>
            <span>最高{compareWith.topScore}%</span>
          </div>
        </div>
      )}
    </div>
  );

  // --- 中央コンテンツ ---
  const centerContent = (
    <>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--hc-navy)", marginBottom: 16 }}>
        マッチング履歴
      </h1>

      {matches.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--hc-text-muted)", fontSize: 13 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          マッチング履歴がありません
          <div style={{ marginTop: 12 }}>
            <Link href="/match" className="btn-primary" style={{ fontSize: 12, padding: "8px 16px", width: "auto", display: "inline-block" }}>
              AI診断を受ける
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {matches.map((m) => (
            <div
              key={m.id}
              onClick={() => handleSelect(m)}
              style={{
                background: "var(--hc-white)",
                border: `1px solid ${selected.id === m.id ? "var(--hc-primary)" : "var(--hc-border)"}`,
                borderRadius: 8,
                padding: 14,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <div style={{ fontSize: 11, color: "var(--hc-text-muted)", marginBottom: 4 }}>{m.date}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "var(--hc-navy)", marginBottom: 4 }}>{m.condition}</div>
              <div style={{ fontSize: 12, color: "var(--hc-primary)", fontWeight: 600 }}>{m.count}件マッチ</div>
            </div>
          ))}
        </div>
      )}
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
