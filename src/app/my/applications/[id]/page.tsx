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

// --- モックデータ（API失敗時フォールバック） ---
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

// --- セクション定義 ---
const SECTIONS = [
  { id: "company", label: "会社情報", icon: "✓", color: "var(--hc-success)" },
  { id: "plan", label: "事業計画", icon: "●", color: "var(--hc-primary)" },
  { id: "estimate", label: "見積書", icon: "○", color: "var(--hc-text-muted)" },
  { id: "docs", label: "添付書類", icon: "○", color: "var(--hc-text-muted)" },
];

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

  // --- 左パネル: セクションナビ ---
  const leftPanel = (
    <div>
      <Link
        href="/my/applications"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          fontSize: 12,
          color: "var(--hc-text-muted)",
          textDecoration: "none",
          marginBottom: 16,
        }}
      >
        ← 申請一覧
      </Link>
      <span className="section-title">セクション</span>
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          style={{
            display: "block",
            padding: "8px 10px",
            marginBottom: 2,
            borderRadius: 6,
            fontSize: 13,
            color: s.color,
            textDecoration: "none",
            transition: "all 0.15s",
            borderLeft: s.id === "plan" ? "3px solid var(--hc-primary)" : "3px solid transparent",
            paddingLeft: s.id === "plan" ? 7 : 10,
            fontWeight: s.id === "plan" ? 500 : 400,
            background: s.id === "plan" ? "var(--hc-primary-muted)" : "transparent",
          }}
        >
          {s.icon} {s.label}
        </a>
      ))}
    </div>
  );

  if (loading) {
    return (
      <ThreeColumnLayout
        left={leftPanel}
        center={<div style={{ color: "var(--hc-text-muted)", fontSize: 13 }}>読み込み中...</div>}
        showRight={false}
        gridCols="200px 1fr 260px"
      />
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
        gridCols="200px 1fr 260px"
      />
    );
  }

  if (!app) return null;

  const progressWidth = app.status === "draft" ? "40%" : app.status === "submitted" ? "60%" : app.status === "approved" ? "100%" : "80%";

  // --- 右パネル: アクション + 添付書類 ---
  const rightPanel = (
    <div>
      <span className="section-title">アクション</span>
      <button
        onClick={handlePdf}
        disabled={pdfLoading}
        style={{
          display: "block",
          width: "100%",
          padding: 12,
          marginBottom: 8,
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 700,
          textAlign: "center",
          cursor: "pointer",
          fontFamily: "inherit",
          background: "var(--hc-primary)",
          color: "#fff",
          border: "2px solid var(--hc-primary)",
          transition: "all 0.3s",
        }}
      >
        {pdfLoading ? "生成中..." : "PDF出力"}
      </button>
      <Link
        href="#"
        style={{
          display: "block",
          width: "100%",
          padding: 12,
          marginBottom: 8,
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 700,
          textAlign: "center",
          background: "var(--hc-white)",
          color: "var(--hc-primary)",
          border: "2px solid var(--hc-primary)",
          textDecoration: "none",
          transition: "all 0.3s",
        }}
      >
        提出する
      </Link>
      <Link
        href="/partners/multik"
        style={{
          display: "block",
          width: "100%",
          padding: 12,
          marginBottom: 8,
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 700,
          textAlign: "center",
          background: "var(--hc-white)",
          color: "var(--hc-primary)",
          border: "2px solid var(--hc-primary)",
          textDecoration: "none",
          transition: "all 0.3s",
        }}
      >
        施工を依頼する
      </Link>

      {app.documents && app.documents.length > 0 && (
        <>
          <div style={{ marginTop: 12 }}>
            <span className="section-title">添付書類</span>
            <div style={{ marginTop: 12 }}>
              {app.documents.map((doc) => (
                <div
                  key={doc.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid var(--hc-border)",
                    fontSize: 12,
                    color: "var(--hc-text-muted)",
                  }}
                >
                  <span style={{ fontWeight: 500, color: "var(--hc-text)" }}>{doc.name}</span>
                  <span>{doc.name.includes("履歴") ? "1.2MB" : "0.8MB"}</span>
                </div>
              ))}
              <div
                style={{
                  padding: "8px 0",
                  fontSize: 12,
                  color: "var(--hc-text-muted)",
                  fontStyle: "italic",
                }}
              >
                + 書類を追加
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // --- テーブルスタイル ---
  const thStyle: React.CSSProperties = {
    textAlign: "left",
    padding: "8px 12px",
    background: "var(--hc-primary-faint)",
    border: "1px solid var(--hc-border)",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--hc-navy)",
    width: "30%",
  };
  const tdStyle: React.CSSProperties = {
    padding: "8px 12px",
    border: "1px solid var(--hc-border)",
    fontSize: 13,
    color: "var(--hc-text-muted)",
  };

  // --- 中央コンテンツ ---
  const centerContent = (
    <>
      {/* プログレスバー */}
      <div style={{ width: "100%", height: 6, background: "var(--hc-text-divider)", borderRadius: 3, overflow: "hidden", marginBottom: 20 }}>
        <div style={{ height: "100%", width: progressWidth, background: "var(--hc-primary)", borderRadius: 3 }} />
      </div>

      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "var(--hc-navy)", letterSpacing: "-0.3px", marginBottom: 8 }}>
        {app.subsidy_name ?? app.subsidy_id}
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--hc-text-muted)", marginLeft: 8 }}>
          {progressWidth.replace("%", "")}%
        </span>
      </h1>

      {/* 会社情報 */}
      <div id="company" style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid var(--hc-border)" }}>
          会社情報
          <a href="#" style={{ fontSize: 12, color: "var(--hc-primary)", fontWeight: 500, textDecoration: "none", float: "right", display: "inline-flex", alignItems: "center", gap: 4 }}>
            編集
          </a>
        </h2>
        <table className="info-table">
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
      <div id="plan" style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid var(--hc-border)" }}>
          事業計画
          <span style={{ fontSize: 11, color: "var(--hc-accent)", fontWeight: 500, marginLeft: 8 }}>入力中</span>
        </h2>
        <table className="info-table">
          <tbody>
            <tr><th style={thStyle}>事業内容</th><td style={{ ...tdStyle, fontStyle: "italic" }}>入力中...</td></tr>
            <tr><th style={thStyle}>導入目的</th><td style={{ ...tdStyle, fontStyle: "italic" }}>入力中...</td></tr>
            <tr><th style={thStyle}>導入台数</th><td style={{ ...tdStyle, fontStyle: "italic" }}>未入力</td></tr>
            <tr><th style={thStyle}>期待効果</th><td style={{ ...tdStyle, fontStyle: "italic" }}>未入力</td></tr>
          </tbody>
        </table>
      </div>

      {/* 見積書 */}
      <div id="estimate" style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid var(--hc-border)" }}>
          見積書
          <span style={{ fontSize: 11, color: "var(--hc-text-muted)", marginLeft: 8 }}>未着手</span>
        </h2>
        <p style={{ fontSize: 13, color: "var(--hc-text-muted)", padding: 20, textAlign: "center", background: "var(--hc-text-faint)", borderRadius: 6 }}>
          事業計画の入力が完了すると見積書の作成に進めます
        </p>
      </div>

      {/* 添付書類 */}
      <div id="docs" style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid var(--hc-border)" }}>
          添付書類
          <span style={{ fontSize: 11, color: "var(--hc-text-muted)", marginLeft: 8 }}>未着手</span>
        </h2>
        <p style={{ fontSize: 13, color: "var(--hc-text-muted)", padding: 20, textAlign: "center", background: "var(--hc-text-faint)", borderRadius: 6 }}>
          見積書の完了後に添付書類をアップロードできます
        </p>
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
