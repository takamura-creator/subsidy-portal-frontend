"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import {
  fetchMyDashboard,
  type Application,
  type ApplicationSummary,
} from "@/lib/api";

// ————— 共有サイドバー（/my 配下全ページ共用） —————
function MySidebar({ active }: { active: string }) {
  const links = [
    { href: "/my", label: "ダッシュボード", icon: "📊" },
    { href: "/my/applications", label: "申請一覧", icon: "📄" },
    { href: "/my/matches", label: "マッチング履歴", icon: "🔍" },
    { href: "/my/settings", label: "アカウント設定", icon: "⚙" },
  ];
  return (
    <nav>
      <p
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.5px",
          textTransform: "uppercase",
          color: "var(--hc-navy)",
          marginBottom: 8,
        }}
      >
        マイページ
      </p>
      {links.map((link) => {
        const isActive = active === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              marginBottom: 2,
              borderRadius: 6,
              fontSize: 13,
              fontWeight: isActive ? 500 : 400,
              color: isActive ? "var(--hc-primary)" : "var(--hc-text-muted)",
              background: isActive ? "rgba(21,128,61,0.06)" : "transparent",
              textDecoration: "none",
              transition: "all 0.15s",
            }}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// ————— モックデータ —————
const MOCK_ALERTS = [
  { id: "it-2026", name: "IT導入補助金 2026", deadline: "2026/4/30", daysLeft: 14 },
];
const MOCK_ACTIVITIES = [
  { dot: "primary", body: <>「<strong>IT導入補助金 申請書</strong>」の事業計画セクションを下書き保存しました</>, time: "2時間前" },
  { dot: "accent", body: <>新しい補助金「<strong>愛知県 防犯カメラ設置費補助</strong>」が追加されました</>, time: "昨日" },
  { dot: "primary", body: <>「<strong>ものづくり補助金</strong>」の締切が近づいています（あと63日）</>, time: "4/11" },
  { dot: "primary", body: <>工事業者 A社から<strong>見積もり回答</strong>がありました</>, time: "4/10" },
  { dot: "success", body: <>「<strong>東京都 防犯設備設置費助成</strong>」が承認されました</>, time: "3/15" },
];
const MOCK_NOTIFS = [
  { title: "見積もり回答", body: "A社から届きました", date: "4/10" },
  { title: "IT導入補助金", body: "締切まであと14日", date: "本日" },
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

  const rightPanel = (
    <div>
      <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--hc-navy)", marginBottom: 8 }}>
        クイックアクション
      </p>
      <Link href="/my/applications/new" className="btn-primary" style={{ display: "block", textAlign: "center", fontSize: 12, padding: "8px 12px", marginBottom: 6 }}>
        📝 新規申請を始める
      </Link>
      <Link href="/match" className="btn-secondary" style={{ display: "block", textAlign: "center", fontSize: 12, padding: "7px 12px", marginBottom: 6 }}>
        ⚡ AI診断を受ける
      </Link>
      <Link href="/contractors" className="btn-secondary" style={{ display: "block", textAlign: "center", fontSize: 12, padding: "7px 12px" }}>
        🔧 工事業者を探す
      </Link>

      <div style={{ height: 1, background: "var(--hc-border)", margin: "12px 0" }} />

      <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--hc-navy)", marginBottom: 8 }}>
        通知
      </p>
      {MOCK_NOTIFS.map((n, i) => (
        <div key={i} style={{ padding: "8px 0", borderBottom: i < MOCK_NOTIFS.length - 1 ? "1px solid var(--hc-border)" : "none", fontSize: 12 }}>
          <strong style={{ color: "var(--hc-navy)" }}>{n.title}</strong> {n.body}
          <div style={{ fontSize: 10, color: "var(--hc-text-muted)", marginTop: 2 }}>{n.date}</div>
        </div>
      ))}

      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: 10, background: "rgba(22,163,74,0.04)", borderRadius: 6, border: "1px solid rgba(22,163,74,0.08)", marginTop: 12 }}>
        <span style={{ fontSize: 20 }}>🐢</span>
        <p style={{ fontSize: 11, color: "var(--hc-text-muted)" }}>東京都の助成が承認されました！</p>
      </div>
    </div>
  );

  const centerContent = (
    <>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--hc-navy)", marginBottom: 16 }}>
        ようこそ、株式会社サンプルさん
      </h1>

      {/* サマリーカード x3 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="card" style={{ textAlign: "center", opacity: 0.5, padding: 16 }}>
              <div style={{ fontSize: 24, fontFamily: "'Sora', sans-serif", fontWeight: 700 }}>—</div>
              <div style={{ fontSize: 11, color: "var(--hc-text-muted)" }}>読み込み中</div>
            </div>
          ))
        ) : (
          <>
            <div className="card" style={{ textAlign: "center", padding: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Sora', sans-serif", color: "var(--hc-accent)" }}>{summary?.submitted ?? 0}</div>
              <div style={{ fontSize: 11, color: "var(--hc-text-muted)" }}>進行中の申請</div>
            </div>
            <div className="card" style={{ textAlign: "center", padding: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Sora', sans-serif", color: "var(--hc-text-muted)" }}>{summary?.deadline_soon ?? 0}</div>
              <div style={{ fontSize: 11, color: "var(--hc-text-muted)" }}>下書き</div>
            </div>
            <div className="card" style={{ textAlign: "center", padding: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Sora', sans-serif", color: "var(--hc-success)" }}>{summary?.approved ?? 0}</div>
              <div style={{ fontSize: 11, color: "var(--hc-text-muted)" }}>承認済み</div>
            </div>
          </>
        )}
      </div>

      {/* 締切アラート */}
      {MOCK_ALERTS.map((alert) => (
        <div key={alert.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--hc-accent-light)", border: "1px solid rgba(202,138,4,0.2)", borderRadius: 8, padding: "12px 14px", marginBottom: 16, fontSize: 13, color: "var(--hc-accent)" }}>
          ⚠
          <div>
            <strong style={{ color: "var(--hc-navy)" }}>{alert.name}</strong>
            の締切が近づいています（あと{alert.daysLeft}日 — {alert.deadline}）
          </div>
        </div>
      ))}

      {/* 最近の活動 */}
      <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--hc-navy)", marginBottom: 8 }}>
        最近の活動
      </p>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {MOCK_ACTIVITIES.map((act, i) => (
          <div key={i} style={{ padding: "10px 14px", borderBottom: i < MOCK_ACTIVITIES.length - 1 ? "1px solid var(--hc-border)" : "none", display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: "var(--hc-text-muted)", lineHeight: 1.4 }}>
            <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: DOT_COLORS[act.dot], flexShrink: 0, marginTop: 6 }} />
            <div style={{ flex: 1 }}>{act.body}</div>
            <span style={{ fontSize: 10, whiteSpace: "nowrap", marginLeft: "auto", flexShrink: 0 }}>{act.time}</span>
          </div>
        ))}
      </div>

      {/* 最近の申請 */}
      {recentApps.length > 0 && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, marginBottom: 8 }}>
            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--hc-navy)" }}>最近の申請</p>
            <Link href="/my/applications" style={{ fontSize: 12, color: "var(--hc-primary)", textDecoration: "none" }}>すべて見る →</Link>
          </div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {recentApps.map((app, i) => (
              <Link key={app.id} href={`/my/applications/${app.id}`} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: i < recentApps.length - 1 ? "1px solid var(--hc-border)" : "none", fontSize: 13, color: "var(--hc-text)", textDecoration: "none" }}>
                <span>{app.subsidy_name ?? app.subsidy_id}</span>
                <span style={{ fontSize: 11, color: "var(--hc-text-muted)" }}>{new Date(app.updated_at).toLocaleDateString("ja-JP")}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );

  return (
    <ThreeColumnLayout left={<MySidebar active="/my" />} center={centerContent} right={rightPanel} />
  );
}
