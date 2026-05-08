"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThreeColumnLayout from "@/components/layout/ThreeColumnLayout";
import { getUser } from "@/lib/auth";

// ウィザードの localStorage キー（wizard/page.tsx と同一）
const STORAGE_KEY = "hc_wizard_state_v2";

interface WizardSnapshot {
  step?: number;
  state?: {
    company?: { companyName?: string };
    subsidy?: { name?: string; maxAmount?: number };
    estimate?: { totalBeforeSubsidy?: number; subsidyAmount?: number; selfPayment?: number };
    documents?: { draft?: { sections?: unknown[] }; tier1Generated?: unknown[] };
    products?: unknown[];
  };
}

function loadWizardSnapshot(): WizardSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WizardSnapshot) : null;
  } catch {
    return null;
  }
}

export default function MyDashboardPage() {
  const [companyName, setCompanyName] = useState<string>("...");
  const [snap, setSnap] = useState<WizardSnapshot | null>(null);

  useEffect(() => {
    // クライアント側でのみ user / localStorage を参照
    const user = getUser();
    setCompanyName(user?.company_name ?? user?.email?.split("@")[0] ?? "ゲスト");
    setSnap(loadWizardSnapshot());
  }, []);

  // ウィザード進捗から表示値を算出
  const wizardStep = snap?.step ?? 0;
  const subsidyName = snap?.state?.subsidy?.name ?? null;
  const estimate = snap?.state?.estimate;
  const hasDraft = !!(
    snap?.state?.documents?.draft?.sections?.length ||
    snap?.state?.documents?.tier1Generated?.length
  );
  const productCount = snap?.state?.products?.length ?? 0;
  const maxSubsidy = estimate?.subsidyAmount
    ? `${(estimate.subsidyAmount / 10000).toFixed(0)}万円`
    : null;
  const selfPayment = estimate?.selfPayment
    ? `${(estimate.selfPayment / 10000).toFixed(0)}万円`
    : null;

  // ウィザード完了度（%）
  const progressPct = wizardStep >= 6 ? 100 : wizardStep >= 1 ? Math.round((wizardStep / 6) * 100) : 0;

  // --- 左パネル: ウィザード進行状況 ---
  const leftPanel = (
    <div className="space-y-3">
      <span className="section-title">ウィザード進行状況</span>

      {subsidyName ? (
        <div
          style={{
            background: "var(--hc-white)",
            border: "1px solid var(--hc-border)",
            borderRadius: 8,
            padding: 12,
            marginTop: 12,
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--hc-text-muted)", marginBottom: 4 }}>
            選択中の補助金
          </p>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--hc-navy)", marginBottom: 8 }}>
            {subsidyName}
          </p>
          {/* プログレスバー */}
          <div style={{ height: 6, borderRadius: 99, background: "var(--hc-border)", marginBottom: 4 }}>
            <div
              style={{
                height: "100%",
                borderRadius: 99,
                background: "var(--hc-primary)",
                width: `${progressPct}%`,
                transition: "width 0.4s",
              }}
            />
          </div>
          <p style={{ fontSize: 10, color: "var(--hc-text-muted)" }}>
            Step {wizardStep} / 6 完了（{progressPct}%）
          </p>
          {productCount > 0 && (
            <p style={{ fontSize: 11, color: "var(--hc-text-muted)", marginTop: 6 }}>
              製品 {productCount} 点を選択中
            </p>
          )}
        </div>
      ) : (
        <div
          style={{
            background: "var(--hc-white)",
            border: "1px dashed var(--hc-border)",
            borderRadius: 8,
            padding: "20px 12px",
            marginTop: 12,
            textAlign: "center",
            color: "var(--hc-text-muted)",
            fontSize: 11,
          }}
        >
          <div style={{ fontSize: 20, marginBottom: 6 }}>📋</div>
          ウィザード未開始
          <div style={{ marginTop: 8 }}>
            <Link
              href="/my/wizard"
              style={{
                fontSize: 11,
                color: "var(--hc-primary)",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              今すぐ始める →
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  // --- 右パネル: クイックアクション ---
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
        📝 {wizardStep >= 1 ? "ウィザードを続ける" : "新規申請を始める"}
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

      {/* マルチックへの相談 */}
      <div
        style={{
          marginTop: 12,
          padding: "14px 12px",
          background: "var(--hc-primary-muted)",
          border: "1px solid var(--hc-primary-edge)",
          borderRadius: 8,
          fontSize: 11,
          color: "var(--hc-navy)",
          lineHeight: 1.6,
        }}
      >
        <p style={{ fontWeight: 700, marginBottom: 4 }}>🔧 施工・詳細見積もりのご相談</p>
        <p style={{ color: "var(--hc-text-muted)", marginBottom: 8 }}>
          施工依頼・詳細見積もりのご相談は、マルチック公式サイトのお問い合わせフォームからどうぞ。
        </p>
        <Link
          href="/contact"
          style={{
            fontSize: 11,
            color: "var(--hc-primary)",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          お問い合わせフォームへ →
        </Link>
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

      {/* HOJYO CAME の用途説明バナー（初回のみ的に表示） */}
      {wizardStep === 0 && (
        <div
          style={{
            background: "var(--hc-primary-muted)",
            border: "1px solid var(--hc-primary-edge)",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 16,
            fontSize: 12,
            color: "var(--hc-navy)",
            lineHeight: 1.7,
          }}
        >
          <strong>HOJYO CAME でできること</strong><br />
          防犯カメラ導入に使える補助金の診断・概算見積もり・申請書類の下書き生成を
          一括でサポートします。実際の補助金交付は各行政機関への申請が必要です。
        </div>
      )}

      {/* サマリーカード x3 — HOJYO CAME 内の進捗ベース */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
        {/* カード1: 概算見積もり */}
        <div className="summary-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Sora', sans-serif", color: "var(--hc-accent)", marginBottom: 2 }}>
            {maxSubsidy ?? "—"}
          </div>
          <div style={{ fontSize: 10, color: "var(--hc-text-muted)", lineHeight: 1.4 }}>
            補助金概算額<br />
            <span style={{ fontSize: 9 }}>（参考値）</span>
          </div>
        </div>

        {/* カード2: 自己負担概算 */}
        <div className="summary-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Sora', sans-serif", color: "var(--hc-text-muted)", marginBottom: 2 }}>
            {selfPayment ?? "—"}
          </div>
          <div style={{ fontSize: 10, color: "var(--hc-text-muted)", lineHeight: 1.4 }}>
            自己負担概算<br />
            <span style={{ fontSize: 9 }}>（参考値）</span>
          </div>
        </div>

        {/* カード3: 書類生成状況 */}
        <div className="summary-card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Sora', sans-serif", color: hasDraft ? "var(--hc-primary)" : "var(--hc-text-muted)", marginBottom: 2 }}>
            {hasDraft ? "✓" : "—"}
          </div>
          <div style={{ fontSize: 10, color: "var(--hc-text-muted)", lineHeight: 1.4 }}>
            申請書下書き<br />
            <span style={{ fontSize: 9 }}>{hasDraft ? "生成済み" : "未生成"}</span>
          </div>
        </div>
      </div>

      <div
        style={{
          fontSize: 10,
          color: "var(--hc-text-muted)",
          marginBottom: 16,
          padding: "6px 10px",
          background: "rgba(0,0,0,0.03)",
          borderRadius: 6,
        }}
      >
        ⚠ 上記の金額は概算参考値です。実際の補助金額は審査機関の判定により異なります。
      </div>

      {/* 次のステップガイド */}
      <span className="section-title">次のステップ</span>
      <div
        style={{
          background: "var(--hc-white)",
          border: "1px solid var(--hc-border)",
          borderRadius: 8,
          overflow: "hidden",
          marginTop: 12,
        }}
      >
        {[
          {
            step: 1,
            label: "会社情報・補助金を選択する",
            done: wizardStep >= 2,
            href: "/my/wizard",
          },
          {
            step: 2,
            label: "製品構成と概算見積もりを確認する",
            done: wizardStep >= 4,
            href: "/my/wizard",
          },
          {
            step: 3,
            label: "申請書類の下書きを生成する",
            done: hasDraft,
            href: "/my/wizard",
          },
          {
            step: 4,
            label: "マルチックに施工・詳細見積もりを依頼する",
            done: false,
            href: "/contact",
          },
        ].map((item, i, arr) => (
          <Link
            key={item.step}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderBottom: i < arr.length - 1 ? "1px solid var(--hc-border)" : "none",
              fontSize: 12,
              color: item.done ? "var(--hc-text-muted)" : "var(--hc-text)",
              textDecoration: "none",
              background: item.done ? "transparent" : "var(--hc-white)",
            }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                flexShrink: 0,
                background: item.done ? "var(--hc-primary)" : "var(--hc-border)",
                color: item.done ? "#fff" : "var(--hc-text-muted)",
              }}
            >
              {item.done ? "✓" : item.step}
            </span>
            <span style={{ flex: 1, textDecoration: item.done ? "line-through" : "none", opacity: item.done ? 0.6 : 1 }}>
              {item.label}
            </span>
            {!item.done && (
              <span style={{ fontSize: 10, color: "var(--hc-primary)", fontWeight: 600 }}>→</span>
            )}
          </Link>
        ))}
      </div>
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
