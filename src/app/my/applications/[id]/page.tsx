"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import {
  fetchApplication,
  generatePdf,
  type ApplicationDetail,
  ApiError,
} from "@/lib/api";

// ————— ステータスバッジ —————
const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  draft: { bg: "rgba(0,0,0,0.05)", color: "var(--hc-text-muted)", label: "下書き" },
  submitted: { bg: "rgba(21,128,61,0.08)", color: "var(--hc-primary)", label: "提出済み" },
  approved: { bg: "rgba(22,163,74,0.08)", color: "var(--hc-success)", label: "承認済み" },
  rejected: { bg: "rgba(220,38,38,0.08)", color: "var(--hc-error)", label: "却下" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.draft;
  return (
    <span style={{ display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 9999, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

// ————— ステータスプログレス —————
const STATUS_STEPS = ["下書き", "提出済み", "審査中", "承認/却下"];
const STATUS_INDEX: Record<string, number> = {
  draft: 0, submitted: 1, reviewing: 2, approved: 3, rejected: 3,
};

function StatusProgress({ status }: { status: string }) {
  const current = STATUS_INDEX[status] ?? 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 24 }}>
      {STATUS_STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: done || active ? "var(--hc-primary)" : "var(--hc-border)", color: done || active ? "#fff" : "var(--hc-text-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, marginBottom: 4 }}>
                {done ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: 10, color: active ? "var(--hc-primary)" : "var(--hc-text-muted)", fontWeight: active ? 600 : 400, whiteSpace: "nowrap" }}>{label}</span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div style={{ height: 2, flex: 1, background: done ? "var(--hc-primary)" : "var(--hc-border)", marginBottom: 16 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ————— モックデータ（API失敗時フォールバック） —————
const MOCK_APP: ApplicationDetail = {
  id: "1",
  subsidy_id: "it-2026",
  subsidy_name: "IT導入補助金 申請書",
  company_name: "株式会社サンプル",
  status: "draft",
  created_at: "2026-04-01T00:00:00Z",
  updated_at: "2026-04-12T00:00:00Z",
  representative_name: "山田 太郎",
  industry: "小売業",
  employees: 12,
  prefecture: "東京都",
  phone: "03-1234-5678",
  email: "yamada@sample.co.jp",
  plan_text: "",
  documents: [
    { name: "履歴事項全部証明書.pdf", uploaded: true, url: "#" },
    { name: "納税証明書.pdf", uploaded: true, url: "#" },
  ],
};

export default function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    fetchApplication(id)
      .then(setApp)
      .catch((err) => {
        if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
          setError("申請が見つかりません");
        } else {
          // フォールバック: モックデータ
          setApp({ ...MOCK_APP, id });
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handlePdf() {
    if (!app) return;
    setPdfLoading(true);
    try {
      const blob = await generatePdf(app.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `申請書_${app.subsidy_name ?? app.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("PDF生成に失敗しました");
    } finally {
      setPdfLoading(false);
    }
  }

  const sections = [
    { id: "company", label: "会社情報", icon: "✓", color: "var(--hc-success)" },
    { id: "plan", label: "事業計画", icon: "●", color: "var(--hc-primary)" },
    { id: "estimate", label: "見積書", icon: "○", color: "var(--hc-text-muted)" },
    { id: "docs", label: "添付書類", icon: "○", color: "var(--hc-text-muted)" },
  ];

  const leftPanel = (
    <div>
      <Link href="/my/applications" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--hc-text-muted)", textDecoration: "none", marginBottom: 16 }}>
        ← 申請一覧
      </Link>
      <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--hc-navy)", marginBottom: 8 }}>
        セクション
      </p>
      {sections.map((s) => (
        <a key={s.id} href={`#${s.id}`} style={{ display: "block", padding: "8px 10px", marginBottom: 2, borderRadius: 6, fontSize: 13, color: s.color, textDecoration: "none", transition: "all 0.15s" }}>
          {s.icon} {s.label}
        </a>
      ))}
    </div>
  );

  if (loading) {
    return (
      <ThreeColumnLayout left={leftPanel} center={<div style={{ color: "var(--hc-text-muted)", fontSize: 13 }}>読み込み中...</div>} showRight={false} />
    );
  }

  if (error) {
    return (
      <ThreeColumnLayout
        left={leftPanel}
        center={
          <>
            <div style={{ color: "var(--hc-error)", fontSize: 13 }}>{error}</div>
            <Link href="/my/applications" className="btn-secondary" style={{ display: "inline-block", fontSize: 12, padding: "8px 16px", marginTop: 12 }}>
              一覧に戻る
            </Link>
          </>
        }
        showRight={false}
      />
    );
  }

  if (!app) return null;

  const rightPanel = (
    <div>
      <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--hc-navy)", marginBottom: 8 }}>
        アクション
      </p>
      <button onClick={handlePdf} disabled={pdfLoading} className="btn-primary" style={{ display: "block", width: "100%", textAlign: "center", fontSize: 12, padding: "10px 12px", marginBottom: 8, cursor: "pointer" }}>
        {pdfLoading ? "生成中..." : "📄 PDF出力"}
      </button>
      {app.status === "draft" && (
        <Link href={`/my/applications/new?edit=${app.id}`} className="btn-secondary" style={{ display: "block", textAlign: "center", fontSize: 12, padding: "8px 12px", marginBottom: 8 }}>
          ✏ 編集する
        </Link>
      )}
      <Link href="/contractors" className="btn-secondary" style={{ display: "block", textAlign: "center", fontSize: 12, padding: "8px 12px", marginBottom: 8 }}>
        🔧 業者に見積依頼
      </Link>

      {app.documents && app.documents.length > 0 && (
        <>
          <div style={{ height: 1, background: "var(--hc-border)", margin: "12px 0" }} />
          <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--hc-navy)", marginBottom: 8 }}>
            添付書類
          </p>
          {app.documents.map((doc) => (
            <div key={doc.name} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--hc-border)", fontSize: 12 }}>
              <span style={{ fontWeight: 500, color: "var(--hc-text)" }}>{doc.name}</span>
              <span style={{ color: doc.uploaded ? "var(--hc-success)" : "var(--hc-text-muted)" }}>
                {doc.uploaded ? "✓" : "未提出"}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );

  const infoTableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse", marginBottom: 12 };
  const thStyle: React.CSSProperties = { textAlign: "left", padding: "8px 12px", background: "rgba(21,128,61,0.03)", border: "1px solid var(--hc-border)", fontSize: 13, fontWeight: 600, color: "var(--hc-navy)", width: "30%" };
  const tdStyle: React.CSSProperties = { padding: "8px 12px", border: "1px solid var(--hc-border)", fontSize: 13, color: "var(--hc-text-muted)" };

  const centerContent = (
    <>
      {/* プログレスバー */}
      <div style={{ width: "100%", height: 6, background: "rgba(0,0,0,0.05)", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
        <div style={{ height: "100%", width: app.status === "draft" ? "40%" : app.status === "submitted" ? "60%" : app.status === "approved" ? "100%" : "80%", background: "var(--hc-primary)", borderRadius: 3 }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "var(--hc-navy)" }}>
          {app.subsidy_name ?? app.subsidy_id}
        </h1>
        <StatusBadge status={app.status} />
      </div>

      {/* ステータスプログレス */}
      <StatusProgress status={app.status} />

      {/* 会社情報 */}
      <div id="company" className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid var(--hc-border)", display: "flex", justifyContent: "space-between" }}>
          会社情報
          {app.status === "draft" && (
            <Link href={`/my/applications/new?edit=${app.id}`} style={{ fontSize: 12, color: "var(--hc-primary)", fontWeight: 500, textDecoration: "none" }}>
              編集
            </Link>
          )}
        </h2>
        <table style={infoTableStyle}>
          <tbody>
            <tr><th style={thStyle}>会社名</th><td style={tdStyle}>{app.company_name}</td></tr>
            <tr><th style={thStyle}>代表者</th><td style={tdStyle}>{app.representative_name ?? "—"}</td></tr>
            <tr><th style={thStyle}>所在地</th><td style={tdStyle}>{app.prefecture ?? "—"}</td></tr>
            <tr><th style={thStyle}>業種</th><td style={tdStyle}>{app.industry ?? "—"}</td></tr>
            <tr><th style={thStyle}>従業員数</th><td style={tdStyle}>{app.employees != null ? `${app.employees}名` : "—"}</td></tr>
          </tbody>
        </table>
      </div>

      {/* 事業計画 */}
      <div id="plan" className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid var(--hc-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          事業計画
          <span style={{ fontSize: 11, color: "var(--hc-accent)", fontWeight: 500 }}>
            {app.plan_text ? "入力済み" : "入力中"}
          </span>
        </h2>
        {app.plan_text ? (
          <p style={{ fontSize: 13, color: "var(--hc-text)", lineHeight: 1.6 }}>{app.plan_text}</p>
        ) : (
          <table style={infoTableStyle}>
            <tbody>
              <tr><th style={thStyle}>事業内容</th><td style={{ ...tdStyle, fontStyle: "italic" }}>入力中...</td></tr>
              <tr><th style={thStyle}>導入目的</th><td style={{ ...tdStyle, fontStyle: "italic" }}>入力中...</td></tr>
              <tr><th style={thStyle}>導入台数</th><td style={{ ...tdStyle, fontStyle: "italic" }}>未入力</td></tr>
              <tr><th style={thStyle}>期待効果</th><td style={{ ...tdStyle, fontStyle: "italic" }}>未入力</td></tr>
            </tbody>
          </table>
        )}
      </div>

      {/* 見積書 */}
      <div id="estimate" className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid var(--hc-border)" }}>
          見積書
        </h2>
        <p style={{ fontSize: 13, color: "var(--hc-text-muted)", padding: "20px", textAlign: "center", background: "rgba(0,0,0,0.02)", borderRadius: 6 }}>
          事業計画の入力が完了すると見積書の作成に進めます
        </p>
      </div>

      {/* 添付書類 */}
      <div id="docs" className="card" style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid var(--hc-border)" }}>
          添付書類
        </h2>
        {app.documents && app.documents.length > 0 ? (
          app.documents.map((doc) => (
            <div key={doc.name} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--hc-border)", fontSize: 13 }}>
              <span style={{ fontWeight: 500 }}>{doc.name}</span>
              <span style={{ color: doc.uploaded ? "var(--hc-success)" : "var(--hc-text-muted)" }}>
                {doc.uploaded ? "アップロード済み" : "未アップロード"}
              </span>
            </div>
          ))
        ) : (
          <p style={{ fontSize: 13, color: "var(--hc-text-muted)", padding: "20px", textAlign: "center", background: "rgba(0,0,0,0.02)", borderRadius: 6 }}>
            見積書の完了後に添付書類をアップロードできます
          </p>
        )}
      </div>
    </>
  );

  return (
    <ThreeColumnLayout left={leftPanel} center={centerContent} right={rightPanel} />
  );
}
