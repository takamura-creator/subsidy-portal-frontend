"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import MySidebar from "@/components/my/MySidebar";
import {
  fetchMyApplications,
  deleteApplication,
  type Application,
} from "@/lib/api";

// --- ステータスフィルター ---
const STATUS_FILTERS = [
  { key: "all", label: "すべて" },
  { key: "draft", label: "下書き" },
  { key: "submitted", label: "提出済み" },
  { key: "approved", label: "承認済み" },
  { key: "rejected", label: "却下" },
];

// --- モックデータ（API失敗時フォールバック） ---
const MOCK_APPS: Application[] = [
  { id: "1", subsidy_id: "it-2026", subsidy_name: "IT導入補助金 申請書", company_name: "株式会社サンプル", status: "draft", created_at: "2026-04-01T00:00:00Z", updated_at: "2026-04-12T00:00:00Z" },
  { id: "2", subsidy_id: "monodukuri", subsidy_name: "ものづくり補助金 事業計画書", company_name: "株式会社サンプル", status: "draft", created_at: "2026-04-01T00:00:00Z", updated_at: "2026-04-10T00:00:00Z" },
  { id: "3", subsidy_id: "jizokuka", subsidy_name: "持続化補助金 申請書", company_name: "株式会社サンプル", status: "submitted", created_at: "2026-03-01T00:00:00Z", updated_at: "2026-03-28T00:00:00Z" },
  { id: "4", subsidy_id: "bouchan", subsidy_name: "東京都 防犯設備設置費助成", company_name: "株式会社サンプル", status: "approved", created_at: "2026-02-01T00:00:00Z", updated_at: "2026-03-15T00:00:00Z" },
];

// --- ステータスバッジ ---
const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  draft: { bg: "var(--hc-text-divider)", color: "var(--hc-text-muted)", label: "下書き" },
  submitted: { bg: "var(--hc-primary-soft)", color: "var(--hc-primary)", label: "提出済み" },
  approved: { bg: "var(--hc-success-edge)", color: "var(--hc-success)", label: "承認済み" },
  rejected: { bg: "var(--hc-error-edge)", color: "var(--hc-error)", label: "却下" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.draft;
  return (
    <span style={{ display: "inline-block", fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 9999, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

// --- 進捗バー表示用 ---
function getProgress(app: Application): number | null {
  if (app.status === "draft") {
    if (app.id === "1") return 40;
    if (app.id === "2") return 20;
    return 30;
  }
  return null;
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

  // --- 左パネル ---
  const leftPanel = (
    <div>
      <MySidebar active="/my/applications" counts={{ applications: 4 }} />
      <div className="divider" />
      <span className="section-title">ステータス</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 12 }}>
        {STATUS_FILTERS.map((f) => {
          const count = f.key === "all" ? MOCK_APPS.length : MOCK_APPS.filter((a) => a.status === f.key).length;
          if (count === 0 && f.key !== "all") return null;
          const isActive = activeFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                padding: "6px 10px",
                borderRadius: 4,
                fontSize: 12,
                border: "none",
                cursor: "pointer",
                background: isActive ? "var(--hc-primary-muted)" : "transparent",
                color: isActive ? "var(--hc-primary)" : "var(--hc-text-muted)",
                fontWeight: isActive ? 500 : 400,
                fontFamily: "inherit",
                transition: "background 0.15s",
              }}
            >
              <span>{f.label}</span>
              <span style={{ fontSize: 11, background: "var(--hc-text-subtle)", padding: "1px 6px", borderRadius: 9999 }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // --- 右パネル ---
  const rightPanel = selected ? (
    <div>
      <span className="section-title">選択した申請</span>
      <div
        style={{
          background: "var(--hc-white)",
          border: "1px solid var(--hc-border)",
          borderRadius: 8,
          padding: 16,
        }}
      >
        <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 13, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 10 }}>
          {selected.subsidy_name ?? selected.subsidy_id}
        </h3>
        {[
          { label: "ステータス", value: STATUS_STYLE[selected.status]?.label ?? selected.status },
          ...(getProgress(selected) != null ? [{ label: "進捗", value: `${getProgress(selected)}%` }] : []),
          { label: "補助金", value: selected.subsidy_name ?? selected.subsidy_id },
          { label: "締切", value: selected.id === "1" ? "4/30" : "—" },
          { label: "更新日", value: new Date(selected.updated_at).toLocaleDateString("ja-JP").replace(/\d{4}\//, "") },
        ].map(({ label, value }) => (
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
            <span
              style={{
                fontWeight: 500,
                color:
                  label === "進捗" ? "var(--hc-primary)" :
                  label === "締切" && value !== "—" ? "var(--hc-accent)" :
                  "var(--hc-text)",
              }}
            >
              {value}
            </span>
          </div>
        ))}

        <Link
          href={`/my/applications/${selected.id}`}
          style={{
            display: "block",
            width: "100%",
            padding: "8px 12px",
            marginTop: 12,
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            textAlign: "center",
            background: "var(--hc-primary)",
            color: "#fff",
            border: "1px solid var(--hc-primary)",
            textDecoration: "none",
          }}
        >
          {selected.status === "draft" ? "編集する" : "詳細を見る"}
        </Link>
        <Link
          href="#"
          style={{
            display: "block",
            width: "100%",
            padding: "8px 12px",
            marginTop: 8,
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
            textAlign: "center",
            background: "var(--hc-white)",
            color: "var(--hc-text)",
            border: "1px solid var(--hc-border)",
            textDecoration: "none",
          }}
        >
          PDF出力
        </Link>
        <button
          onClick={() => handleDelete(selected.id)}
          disabled={deleting === selected.id}
          style={{
            display: "block",
            width: "100%",
            padding: "8px 12px",
            marginTop: 8,
            borderRadius: 6,
            fontSize: 12,
            border: "1px solid var(--hc-error-line)",
            background: "transparent",
            color: "var(--hc-error)",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {deleting === selected.id ? "削除中..." : "削除"}
        </button>
      </div>
    </div>
  ) : (
    <div>
      <span className="section-title">選択した申請</span>
      <p style={{ fontSize: 12, color: "var(--hc-text-muted)" }}>申請を選択すると詳細が表示されます</p>
    </div>
  );

  // --- 中央コンテンツ ---
  const centerContent = (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--hc-navy)", margin: 0 }}>
          申請一覧
        </h1>
        <Link
          href="/my/wizard"
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            textAlign: "center",
            background: "var(--hc-primary)",
            color: "#fff",
            border: "1px solid var(--hc-primary)",
            textDecoration: "none",
          }}
        >
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
            <Link href="/my/wizard" className="btn-primary" style={{ fontSize: 12, padding: "8px 16px", width: "auto", display: "inline-block" }}>
              最初の申請を作成
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {apps.map((app) => {
            const progress = getProgress(app);
            return (
              <div
                key={app.id}
                onClick={() => setSelected(app)}
                style={{
                  background: "var(--hc-white)",
                  border: `1px solid ${selected?.id === app.id ? "var(--hc-primary)" : "var(--hc-border)"}`,
                  borderRadius: 8,
                  padding: 14,
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 12,
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--hc-navy)" }}>
                    {app.subsidy_name ?? app.subsidy_id}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--hc-text-muted)", marginTop: 4 }}>
                    <span>
                      {app.status === "draft" ? "最終更新" : app.status === "submitted" ? "提出日" : "承認日"}:{" "}
                      {new Date(app.updated_at).toLocaleDateString("ja-JP").replace(/\d{4}\//, "")}
                    </span>
                    <StatusBadge status={app.status} />
                  </div>
                  {progress != null && (
                    <div style={{ marginTop: 6, width: 120, height: 4, background: "var(--hc-text-divider)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${progress}%`, background: "var(--hc-primary)", borderRadius: 2 }} />
                    </div>
                  )}
                </div>
                <Link
                  href={`/my/applications/${app.id}`}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 500,
                    border: "1px solid var(--hc-border)",
                    background: "var(--hc-white)",
                    color: "var(--hc-text)",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                    transition: "all 0.15s",
                  }}
                >
                  {app.status === "draft" ? "編集" : "詳細"}
                </Link>
              </div>
            );
          })}
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
