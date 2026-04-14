"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import MySidebar from "@/components/my/MySidebar";
import {
  fetchMyDashboard,
  type Application,
  type ApplicationSummary,
} from "@/lib/api";

// --- モックデータ ---
const MOCK_ALERTS = [
  { id: "it-2026", name: "IT導入補助金", deadline: "2026/4/30", daysLeft: 14 },
];
const MOCK_ACTIVITIES = [
  { dot: "primary", body: <><strong>IT導入補助金 申請書</strong>の事業計画セクションを下書き保存しました</>, time: "2時間前" },
  { dot: "accent", body: <>新しい補助金 <strong>愛知県 防犯カメラ設置費補助</strong> が追加されました</>, time: "昨日" },
  { dot: "primary", body: <><strong>ものづくり補助金</strong>の締切が近づいています（あと63日）</>, time: "4/11" },
  { dot: "primary", body: <>工事業者 A社から<strong>見積もり回答</strong>がありました</>, time: "4/10" },
  { dot: "success", body: <><strong>東京都 防犯設備設置費助成</strong>が承認されました</>, time: "3/15" },
];
const MOCK_NOTIFS = [
  { title: "見積もり回答", body: "がA社から届きました", date: "4/10" },
  { title: "IT導入補助金", body: "の締切まであと14日", date: "本日" },
];
const DOT_COLORS: Record<string, string> = {
  primary: "var(--hc-primary)",
  accent: "var(--hc-accent)",
  success: "var(--hc-success)",
};

export default function MyDashboardPage() {
  const [summary, setSummary] = useState<ApplicationSummary | null>(null);
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyDashboard()
      .then((res) => {
        setSummary(res.summary ?? { submitted: 1, approved: 1, deadline_soon: 2 });
        setRecentApps(res.applications.slice(0, 5));
      })
      .catch(() => {
        setSummary({ submitted: 1, approved: 1, deadline_soon: 2 });
        setRecentApps([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // --- 左パネル ---
  const leftPanel = (
    <div>
      <MySidebar active="/my" counts={{ applications: 2, matches: 3 }} />
      <div className="divider" />
      <span className="section-title">おすすめ補助金</span>
      <div
        style={{
          background: "var(--hc-white)",
          border: "1px solid var(--hc-border)",
          borderRadius: 8,
          padding: 12,
          marginTop: 12,
        }}
      >
        <h4 style={{ fontSize: 12, fontWeight: 600, color: "var(--hc-navy)", marginBottom: 4 }}>
          IT導入補助金
        </h4>
        <p style={{ fontSize: 11, color: "var(--hc-text-muted)", marginBottom: 6 }}>
          セキュリティ対策推進枠 最大100万円
        </p>
        <span
          style={{
            fontSize: 10,
            color: "var(--hc-accent)",
            background: "var(--hc-accent-light)",
            padding: "2px 8px",
            borderRadius: 9999,
            fontWeight: 600,
          }}
        >
          あと14日
        </span>
      </div>
    </div>
  );

  // --- 右パネル ---
  const rightPanel = (
    <div>
      <span className="section-title">クイックアクション</span>
      <Link
        href="/my/applications/new"
        style={{
          display: "block",
          width: "100%",
          padding: "10px 12px",
          marginBottom: 6,
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          textAlign: "center",
          background: "var(--hc-primary)",
          color: "#fff",
          border: "1px solid var(--hc-primary)",
          textDecoration: "none",
          transition: "all 0.15s",
        }}
      >
        📝 新規申請を始める
      </Link>
      <Link
        href="/match"
        style={{
          display: "block",
          width: "100%",
          padding: "10px 12px",
          marginBottom: 6,
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 500,
          textAlign: "left",
          background: "var(--hc-white)",
          color: "var(--hc-text)",
          border: "1px solid var(--hc-border)",
          textDecoration: "none",
          transition: "all 0.15s",
        }}
      >
        ⚡ AI診断を受ける
      </Link>
      <Link
        href="/contractors"
        style={{
          display: "block",
          width: "100%",
          padding: "10px 12px",
          marginBottom: 6,
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 500,
          textAlign: "left",
          background: "var(--hc-white)",
          color: "var(--hc-text)",
          border: "1px solid var(--hc-border)",
          textDecoration: "none",
          transition: "all 0.15s",
        }}
      >
        🔧 工事業者を探す
      </Link>

      <div className="divider" />

      <span className="section-title">通知</span>
      <div style={{ marginTop: 12 }}>
        {MOCK_NOTIFS.map((n, i) => (
          <div
            key={i}
            style={{
              padding: "8px 0",
              borderBottom: i < MOCK_NOTIFS.length - 1 ? "1px solid var(--hc-border)" : "none",
              fontSize: 11,
              color: "var(--hc-text-muted)",
              lineHeight: 1.4,
            }}
          >
            <strong style={{ color: "var(--hc-text)", fontWeight: 500 }}>{n.title}</strong>
            {n.body}
            <div style={{ fontSize: 10, color: "var(--hc-text-muted)", marginTop: 2 }}>{n.date}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: 10,
          background: "rgba(22,163,74,0.04)",
          borderRadius: 6,
          border: "1px solid rgba(22,163,74,0.08)",
          marginTop: 12,
        }}
      >
        <span style={{ fontSize: 20 }}>🐢</span>
        <p style={{ fontSize: 11, color: "var(--hc-text-muted)", margin: 0 }}>
          東京都の助成が承認されました！
        </p>
      </div>
    </div>
  );

  // --- 中央コンテンツ ---
  const centerContent = (
    <>
      <h1
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: "1.1rem",
          fontWeight: 700,
          color: "var(--hc-navy)",
          letterSpacing: "-0.3px",
          marginBottom: 16,
        }}
      >
        ようこそ、株式会社サンプルさん
      </h1>

      {/* サマリーカード x3 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="summary-card" style={{ textAlign: "center", opacity: 0.5 }}>
              <div style={{ fontSize: 24, fontFamily: "'Sora', sans-serif", fontWeight: 700 }}>—</div>
              <div style={{ fontSize: 11, color: "var(--hc-text-muted)" }}>読み込み中</div>
            </div>
          ))
        ) : (
          <>
            <div className="summary-card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Sora', sans-serif", color: "var(--hc-accent)", marginBottom: 2 }}>
                {summary?.submitted ?? 0}
              </div>
              <div style={{ fontSize: 11, color: "var(--hc-text-muted)" }}>進行中の申請</div>
            </div>
            <div className="summary-card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Sora', sans-serif", color: "var(--hc-text-muted)", marginBottom: 2 }}>
                {summary?.deadline_soon ?? 0}
              </div>
              <div style={{ fontSize: 11, color: "var(--hc-text-muted)" }}>下書き</div>
            </div>
            <div className="summary-card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Sora', sans-serif", color: "var(--hc-success)", marginBottom: 2 }}>
                {summary?.approved ?? 0}
              </div>
              <div style={{ fontSize: 11, color: "var(--hc-text-muted)" }}>承認済み</div>
            </div>
          </>
        )}
      </div>

      {/* 締切アラート */}
      {MOCK_ALERTS.map((alert) => (
        <div
          key={alert.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "var(--hc-accent-light)",
            border: "1px solid rgba(202,138,4,0.2)",
            borderRadius: 8,
            padding: "12px 14px",
            marginBottom: 16,
            fontSize: 13,
            color: "var(--hc-accent)",
          }}
        >
          ⚠
          <div>
            <strong style={{ color: "var(--hc-navy)" }}>{alert.name}</strong>
            の締切が近づいています（あと{alert.daysLeft}日 — {alert.deadline}）
          </div>
        </div>
      ))}

      {/* 最近の活動 */}
      <span className="section-title">最近の活動</span>
      <div
        style={{
          background: "var(--hc-white)",
          border: "1px solid var(--hc-border)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {MOCK_ACTIVITIES.map((act, i) => (
          <div
            key={i}
            style={{
              padding: "10px 14px",
              borderBottom: i < MOCK_ACTIVITIES.length - 1 ? "1px solid var(--hc-border)" : "none",
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              fontSize: 12,
              color: "var(--hc-text-muted)",
              lineHeight: 1.4,
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: DOT_COLORS[act.dot],
                flexShrink: 0,
                marginTop: 5,
              }}
            />
            <div style={{ flex: 1 }}>{act.body}</div>
            <span style={{ fontSize: 10, whiteSpace: "nowrap", marginLeft: "auto", flexShrink: 0 }}>
              {act.time}
            </span>
          </div>
        ))}
      </div>

      {/* 最近の申請（APIから取得した場合のみ） */}
      {recentApps.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, marginBottom: 8 }}>
            <span className="section-title" style={{ marginBottom: 0 }}>最近の申請</span>
            <Link href="/my/applications" style={{ fontSize: 12, color: "var(--hc-primary)", textDecoration: "none" }}>
              すべて見る →
            </Link>
          </div>
          <div
            style={{
              background: "var(--hc-white)",
              border: "1px solid var(--hc-border)",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            {recentApps.map((app, i) => (
              <Link
                key={app.id}
                href={`/my/applications/${app.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderBottom: i < recentApps.length - 1 ? "1px solid var(--hc-border)" : "none",
                  fontSize: 13,
                  color: "var(--hc-text)",
                  textDecoration: "none",
                }}
              >
                <span>{app.subsidy_name ?? app.subsidy_id}</span>
                <span style={{ fontSize: 11, color: "var(--hc-text-muted)" }}>
                  {new Date(app.updated_at).toLocaleDateString("ja-JP")}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );

  return (
    <ThreeColumnLayout
      left={leftPanel}
      center={centerContent}
      right={rightPanel}
      gridCols="200px 1fr 240px"
    />
  );
}
