"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
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

export default function MyApplicationsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Application | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchMyApplications({
        status: activeFilter === "all" ? undefined : activeFilter,
      });
      setApps(res.applications);
      if (res.applications.length > 0) setSelected(res.applications[0]);
      else setSelected(null);
    } catch {
      setApps([]);
      setSelected(null);
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

  // ステータス別件数（ロード済みデータから算出）
  function getFilterCount(key: string): number {
    if (key === "all") return apps.length;
    return apps.filter((a) => a.status === key).length;
  }

  // --- 左パネル ---
  const leftPanel = (
    <div>
      <span className="section-title">ステータス</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 12 }}>
        {STATUS_FILTERS.map((f) => {
          const count = getFilterCount(f.key);
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
          { label: "補助金", value: selected.subsidy_name ?? selected.subsidy_id },
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
            <span style={{ fontWeight: 500, color: "var(--hc-text)" }}>{value}</span>
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
      <p style={{ fontSize: 12, color: "var(--hc-text-muted)", marginTop: 8 }}>申請を選択すると詳細が表示されます</p>
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
          {apps.map((app) => (
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
