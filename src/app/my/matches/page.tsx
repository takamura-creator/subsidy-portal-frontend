"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";

// ————— 共有サイドバー —————
function MySidebar({ active }: { active: string }) {
  const links = [
    { href: "/my", label: "ダッシュボード", icon: "📊" },
    { href: "/my/applications", label: "申請一覧", icon: "📄" },
    { href: "/my/matches", label: "マッチング履歴", icon: "🔍" },
    { href: "/my/settings", label: "アカウント設定", icon: "⚙" },
  ];
  return (
    <nav>
      <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", color: "var(--hc-navy)", marginBottom: 8 }}>
        マイページ
      </p>
      {links.map((link) => {
        const isActive = active === link.href;
        return (
          <Link key={link.href} href={link.href} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", marginBottom: 2, borderRadius: 6, fontSize: 13, fontWeight: isActive ? 500 : 400, color: isActive ? "var(--hc-primary)" : "var(--hc-text-muted)", background: isActive ? "rgba(21,128,61,0.06)" : "transparent", textDecoration: "none", transition: "all 0.15s" }}>
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// ————— 型定義 —————
interface MatchRecord {
  id: string;
  date: string;
  condition: string;
  count: number;
  topScore: number;
  purpose: string;
  matches: { name: string; score: number }[];
}

// ————— モックデータ —————
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
  const [matches, setMatches] = useState<MatchRecord[]>(MOCK_MATCHES);
  const [selected, setSelected] = useState<MatchRecord>(MOCK_MATCHES[0]);
  const [compareWith, setCompareWith] = useState<MatchRecord | null>(MOCK_MATCHES[1]);
  const [dateFilter, setDateFilter] = useState("all");

  function handleSelect(m: MatchRecord) {
    setSelected(m);
    if (compareWith?.id === m.id) setCompareWith(null);
  }

  const leftPanel = (
    <div>
      <MySidebar active="/my/matches" />
      <div style={{ height: 1, background: "var(--hc-border)", margin: "12px 0" }} />
      <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--hc-navy)", marginBottom: 8 }}>
        期間
      </p>
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

  const rightPanel = (
    <div>
      <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--hc-navy)", marginBottom: 8 }}>
        比較
      </p>

      {compareWith ? (
        <div className="card" style={{ padding: 14 }}>
          <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 10 }}>
            2回の診断結果を比較
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, padding: "6px 0", borderBottom: "1px solid var(--hc-border)", fontSize: 11 }}>
            <span style={{ fontWeight: 600, color: "var(--hc-navy)" }}>
              {selected.date.slice(5, 10)}
            </span>
            <span style={{ fontWeight: 600, color: "var(--hc-navy)" }}>
              {compareWith.date.slice(5, 10)}
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, padding: "6px 0", borderBottom: "1px solid var(--hc-border)", fontSize: 11 }}>
            <span>{selected.count}件マッチ</span>
            <span>{compareWith.count}件マッチ</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, padding: "6px 0", borderBottom: "1px solid var(--hc-border)", fontSize: 11 }}>
            <span>{selected.purpose}</span>
            <span>{compareWith.purpose}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, padding: "6px 0", fontSize: 11 }}>
            <span>最高{selected.topScore}%</span>
            <span>最高{compareWith.topScore}%</span>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 14, fontSize: 12, color: "var(--hc-text-muted)" }}>
          <p style={{ marginBottom: 8 }}>別の診断を選択して比較できます</p>
          {matches.filter((m) => m.id !== selected.id).slice(0, 2).map((m) => (
            <button
              key={m.id}
              onClick={() => setCompareWith(m)}
              style={{ display: "block", width: "100%", padding: "6px 8px", marginBottom: 4, borderRadius: 4, border: "1px solid var(--hc-border)", background: "#fff", cursor: "pointer", fontSize: 11, color: "var(--hc-primary)", textAlign: "left" }}
            >
              {m.date.slice(0, 10)} — {m.purpose}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <>
          <div style={{ height: 1, background: "var(--hc-border)", margin: "12px 0" }} />
          <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--hc-navy)", marginBottom: 8 }}>
            マッチした補助金
          </p>
          <div className="card" style={{ padding: 14 }}>
            {selected.matches.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: i < selected.matches.length - 1 ? "1px solid var(--hc-border)" : "none", fontSize: 12 }}>
                <span style={{ color: "var(--hc-text)", maxWidth: 140 }}>{m.name}</span>
                <span style={{ fontWeight: 600, color: m.score >= 80 ? "var(--hc-success)" : m.score >= 60 ? "var(--hc-accent)" : "var(--hc-text-muted)" }}>
                  {m.score}%
                </span>
              </div>
            ))}
          </div>
          <Link href="/match" className="btn-primary" style={{ display: "block", textAlign: "center", fontSize: 12, padding: "8px 12px", marginTop: 12 }}>
            再診断する
          </Link>
        </>
      )}
    </div>
  );

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
            <Link href="/match" className="btn-primary" style={{ fontSize: 12, padding: "8px 16px" }}>AI診断を受ける</Link>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {matches.map((m) => (
            <div
              key={m.id}
              className="card"
              onClick={() => handleSelect(m)}
              style={{ padding: 14, cursor: "pointer", borderColor: selected.id === m.id ? "var(--hc-primary)" : "var(--hc-border)" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--hc-text-muted)", marginBottom: 4 }}>{m.date}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--hc-navy)", marginBottom: 4 }}>{m.condition}</div>
                  <div style={{ fontSize: 12, color: "var(--hc-primary)", fontWeight: 600 }}>{m.count}件マッチ</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--hc-success)" }}>最高{m.topScore}%</div>
                  {compareWith?.id === m.id && (
                    <span style={{ fontSize: 10, color: "var(--hc-accent)", background: "var(--hc-accent-light)", padding: "1px 6px", borderRadius: 9999 }}>比較中</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 16, fontSize: 12, color: "var(--hc-text-muted)" }}>
        診断履歴: {matches.length}件
      </div>
    </>
  );

  return (
    <ThreeColumnLayout left={leftPanel} center={centerContent} right={rightPanel} />
  );
}
