"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import {
  fetchMyApplications,
  deleteApplication,
  type Application,
  ApiError,
} from "@/lib/api";

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

// ————— ステータスフィルターサイドバー下部 —————
const STATUS_FILTERS = [
  { key: "all", label: "すべて" },
  { key: "draft", label: "下書き" },
  { key: "submitted", label: "提出済み" },
  { key: "approved", label: "承認済み" },
  { key: "rejected", label: "却下" },
];

// ————— モックデータ（API失敗時フォールバック） —————
const MOCK_APPS: Application[] = [
  { id: "1", subsidy_id: "it-2026", subsidy_name: "IT導入補助金 申請書", company_name: "株式会社サンプル", status: "draft", created_at: "2026-04-01T00:00:00Z", updated_at: "2026-04-12T00:00:00Z" },
  { id: "2", subsidy_id: "monodukuri", subsidy_name: "ものづくり補助金 事業計画書", company_name: "株式会社サンプル", status: "draft", created_at: "2026-04-01T00:00:00Z", updated_at: "2026-04-10T00:00:00Z" },
  { id: "3", subsidy_id: "jizokuka", subsidy_name: "持続化補助金 申請書", company_name: "株式会社サンプル", status: "submitted", created_at: "2026-03-01T00:00:00Z", updated_at: "2026-03-28T00:00:00Z" },
  { id: "4", subsidy_id: "bouchan", subsidy_name: "東京都 防犯設備設置費助成", company_name: "株式会社サンプル", status: "approved", created_at: "2026-02-01T00:00:00Z", updated_at: "2026-03-15T00:00:00Z" },
];

// ステータスバッジスタイル
const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  draft: { bg: "rgba(0,0,0,0.05)", color: "var(--hc-text-muted)", label: "下書き" },
  submitted: { bg: "rgba(21,128,61,0.08)", color: "var(--hc-primary)", label: "提出済み" },
  approved: { bg: "rgba(22,163,74,0.08)", color: "var(--hc-success)", label: "承認済み" },
  rejected: { bg: "rgba(220,38,38,0.08)", color: "var(--hc-error)", label: "却下" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.draft;
  return (
    <span style={{ display: "inline-block", fontSize: 10, fontWeight: 600, padding: "2px 10px", borderRadius: 9999, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

export default function MyApplicationsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [apps, setApps] = useState<Application[]>(MOCK_APPS);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Application | null>(MOCK_APPS[0]);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchMyApplications({
        status: activeFilter === "all" ? undefined : activeFilter,
      });
      setApps(res.applications);
      if (res.applications.length > 0) setSelected(res.applications[0]);
    } catch {
      // フォールバック: モックデータ表示
      const filtered = activeFilter === "all" ? MOCK_APPS : MOCK_APPS.filter((a) => a.status === activeFilter);
      setApps(filtered);
      if (filtered.length > 0) setSelected(filtered[0]);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("この申請を削除しますか？")) return;
    setDeleting(id);
    try {
      await deleteApplication(id);
      setApps((prev) => prev.filter((a) => a.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch {
      alert("削除に失敗しました");
    } finally {
      setDeleting(null);
    }
  }

  const leftPanel = (
    <div>
      <MySidebar active="/my/applications" />
      <div style={{ height: 1, background: "var(--hc-border)", margin: "12px 0" }} />
      <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--hc-navy)", marginBottom: 8 }}>
        ステータス
      </p>
      {STATUS_FILTERS.map((f) => {
        const count = f.key === "all" ? MOCK_APPS.length : MOCK_APPS.filter((a) => a.status === f.key).length;
        const isActive = activeFilter === f.key;
        return (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "6px 10px", borderRadius: 4, fontSize: 12, border: "none", cursor: "pointer", background: isActive ? "rgba(21,128,61,0.06)" : "transparent", color: isActive ? "var(--hc-primary)" : "var(--hc-text-muted)", fontWeight: isActive ? 500 : 400, marginBottom: 2, transition: "background 0.15s" }}
          >
            <span>{f.label}</span>
            <span style={{ fontSize: 11, background: "rgba(0,0,0,0.04)", padding: "1px 6px", borderRadius: 9999 }}>{count}</span>
          </button>
        );
      })}
    </div>
  );

  const rightPanel = selected ? (
    <div>
      <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--hc-navy)", marginBottom: 8 }}>
        選択した申請
      </p>
      <div className="card" style={{ padding: 16 }}>
        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 10 }}>
          {selected.subsidy_name ?? selected.subsidy_id}
        </h3>
        {[
          { label: "ステータス", value: <StatusBadge status={selected.status} /> },
          { label: "補助金", value: selected.subsidy_name ?? selected.subsidy_id },
          { label: "更新日", value: new Date(selected.updated_at).toLocaleDateString("ja-JP") },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--hc-border)", fontSize: 12 }}>
            <span style={{ color: "var(--hc-text-muted)" }}>{label}</span>
            <span style={{ fontWeight: 500 }}>{value}</span>
          </div>
        ))}

        <Link href={`/my/applications/${selected.id}`} className="btn-primary" style={{ display: "block", textAlign: "center", fontSize: 12, padding: "8px 12px", marginTop: 12 }}>
          {selected.status === "draft" ? "編集する" : "詳細を見る"}
        </Link>
        <button
          onClick={() => handleDelete(selected.id)}
          disabled={deleting === selected.id}
          style={{ display: "block", width: "100%", padding: "8px 12px", marginTop: 6, borderRadius: 6, fontSize: 12, border: "1px solid rgba(220,38,38,0.2)", background: "transparent", color: "var(--hc-error)", cursor: "pointer" }}
        >
          {deleting === selected.id ? "削除中..." : "削除"}
        </button>
      </div>
    </div>
  ) : (
    <div>
      <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--hc-navy)", marginBottom: 8 }}>
        選択した申請
      </p>
      <p style={{ fontSize: 12, color: "var(--hc-text-muted)" }}>申請を選択すると詳細が表示されます</p>
    </div>
  );

  const centerContent = (
    <>
      {/* ヘッダー */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--hc-navy)" }}>申請一覧</h1>
        <Link href="/my/applications/new" className="btn-primary" style={{ fontSize: 12, padding: "8px 16px" }}>
          + 新規申請
        </Link>
      </div>

      {loading ? (
        <div style={{ color: "var(--hc-text-muted)", fontSize: 13 }}>読み込み中...</div>
      ) : apps.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--hc-text-muted)", fontSize: 13 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📄</div>
          申請がありません
          <div style={{ marginTop: 12 }}>
            <Link href="/my/applications/new" className="btn-primary" style={{ fontSize: 12, padding: "8px 16px" }}>最初の申請を作成</Link>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {apps.map((app) => (
            <div
              key={app.id}
              className="card"
              onClick={() => setSelected(app)}
              style={{ padding: 14, cursor: "pointer", borderColor: selected?.id === app.id ? "var(--hc-primary)" : "var(--hc-border)", display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center" }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--hc-navy)", marginBottom: 4 }}>
                  {app.subsidy_name ?? app.subsidy_id}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--hc-text-muted)" }}>
                  <span>最終更新: {new Date(app.updated_at).toLocaleDateString("ja-JP")}</span>
                  <StatusBadge status={app.status} />
                </div>
              </div>
              <Link
                href={`/my/applications/${app.id}`}
                onClick={(e) => e.stopPropagation()}
                className="btn-secondary"
                style={{ fontSize: 12, padding: "6px 12px", whiteSpace: "nowrap" }}
              >
                {app.status === "draft" ? "編集" : "詳細"}
              </Link>
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <ThreeColumnLayout left={leftPanel} center={centerContent} right={rightPanel} />
  );
}
