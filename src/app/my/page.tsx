"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { getUser } from "@/lib/auth";
import {
  fetchMyDashboard,
  type Application,
  type ApplicationSummary,
} from "@/lib/api";

export default function MyDashboardPage() {
  const [summary, setSummary] = useState<ApplicationSummary | null>(null);
  const [recentApps, setRecentApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const user = getUser();
  const companyName = user?.company_name ?? user?.email ?? "ゲスト";

  useEffect(() => {
    fetchMyDashboard()
      .then((res) => {
        setSummary(res.summary ?? { submitted: 0, approved: 0, deadline_soon: 0 });
        setRecentApps(res.applications.slice(0, 5));
      })
      .catch(() => {
        setSummary({ submitted: 0, approved: 0, deadline_soon: 0 });
        setRecentApps([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // --- 左パネル ---
  const leftPanel = (
    <div>
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
          公募中
        </span>
      </div>
    </div>
  );

  // --- 右パネル ---
  const rightPanel = (
    <div>
      <span className="section-title">クイックアクション</span>
      <Link
        href="/my/wizard"
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
        href="/my/wizard"
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
        📋 見積もり・書類ウィザード
      </Link>
      <Link
        href="/partners/multik"
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
        <div style={{ fontSize: 20, marginBottom: 6 }}>🔔</div>
        まだ通知はありません
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
        ようこそ、{companyName}さん
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

      {/* 最近の活動 */}
      <span className="section-title">最近の活動</span>
      {recentApps.length === 0 ? (
        <div
          style={{
            background: "var(--hc-white)",
            border: "1px solid var(--hc-border)",
            borderRadius: 8,
            padding: "32px 20px",
            textAlign: "center",
            color: "var(--hc-text-muted)",
            fontSize: 13,
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
          まだ活動はありません
          <div style={{ marginTop: 12 }}>
            <Link
              href="/my/wizard"
              style={{
                display: "inline-block",
                padding: "8px 16px",
                background: "var(--hc-primary)",
                color: "#fff",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              最初の申請を始める
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <span />
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
