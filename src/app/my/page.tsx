"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import { fetchProfileDetail } from "@/lib/api";

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

/* ── DESIGN.md 準拠スタイル定数 ── */
const SHADOW_CARD =
  "rgba(13,82,95,0.08) 0px 12px 28px -12px, rgba(0,0,0,0.04) 0px 4px 12px -4px, rgba(0,0,0,0.02) 0px 1px 4px";
const BORDER_WHISPER = "1px solid rgba(0,0,0,0.08)";
const RADIUS_CARD = 12;
const RADIUS_STANDARD = 6;

export default function MyDashboardPage() {
  // Sidebar.tsx と同じパターン: トップレベルで JWT 同期取得
  // (MyLayout が ready=true を確認してから描画するので SSR では呼ばれない)
  const user = getUser();
  const jwtName = user?.company_name ?? user?.email?.split("@")[0] ?? "ゲスト";

  const [companyName, setCompanyName] = useState<string>(jwtName);
  const [snap, setSnap] = useState<WizardSnapshot | null>(null);

  useEffect(() => {
    // DB からの確定表示（Sidebar と同じ fetchProfileDetail）
    fetchProfileDetail()
      .then((p) => {
        if (p.company_name) setCompanyName(p.company_name);
      })
      .catch(() => {});

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

  // 次のステップ定義
  const steps = [
    { step: 1, label: "会社情報・補助金を選択する", done: wizardStep >= 2, href: "/my/wizard" },
    { step: 2, label: "製品構成と概算見積もりを確認する", done: wizardStep >= 4, href: "/my/wizard" },
    { step: 3, label: "申請書類の下書きを生成する", done: hasDraft, href: "/my/wizard" },
    { step: 4, label: "マルチックに施工・詳細見積もりを依頼する", done: false, href: "/contact" },
  ];

  return (
    <div style={{ maxWidth: 880 }}>
      {/* ── ウェルカムヘッダー ── */}
      <h1
        style={{
          fontFamily: "'Noto Sans JP', sans-serif",
          fontSize: 22,
          fontWeight: 500,
          color: "#1E3A5F",
          letterSpacing: "-0.3px",
          lineHeight: 1.3,
          marginBottom: 8,
        }}
      >
        ようこそ、{companyName}さん
      </h1>

      {subsidyName && (
        <p
          style={{
            fontSize: 13,
            color: "#6B6B7B",
            marginBottom: 24,
            fontWeight: 400,
          }}
        >
          選択中の補助金：
          <span style={{ fontWeight: 500, color: "#1A1A1A" }}>{subsidyName}</span>
          {productCount > 0 && (
            <span style={{ marginLeft: 12, color: "#6B6B7B" }}>
              ／ 製品 {productCount} 点
            </span>
          )}
        </p>
      )}

      {/* ── 初回バナー（ウィザード未開始時） ── */}
      {wizardStep === 0 && (
        <div
          style={{
            background: "rgba(13,148,136,0.04)",
            border: "1px solid rgba(13,148,136,0.15)",
            borderRadius: RADIUS_CARD,
            padding: "16px 20px",
            marginBottom: 24,
            fontSize: 14,
            color: "#1A1A1A",
            lineHeight: 1.7,
          }}
        >
          <strong style={{ fontWeight: 500 }}>HOJYO CAME でできること</strong>
          <br />
          防犯カメラ導入に使える補助金の診断・概算見積もり・申請書類の下書き生成を一括でサポートします。
          実際の補助金交付は各行政機関への申請が必要です。
        </div>
      )}

      {/* ── サマリーカード 3枚 ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <SummaryCard
          value={maxSubsidy ?? "—"}
          label="補助金概算額"
          sub="（参考値）"
          color="#D97706"
          active={!!maxSubsidy}
        />
        <SummaryCard
          value={selfPayment ?? "—"}
          label="自己負担概算"
          sub="（参考値）"
          color="#6B6B7B"
          active={!!selfPayment}
        />
        <SummaryCard
          value={hasDraft ? "✓" : "—"}
          label="申請書下書き"
          sub={hasDraft ? "生成済み" : "未生成"}
          color={hasDraft ? "#0D9488" : "#6B6B7B"}
          active={hasDraft}
        />
      </div>

      {maxSubsidy && (
        <p
          style={{
            fontSize: 12,
            color: "#6B6B7B",
            marginBottom: 24,
            padding: "8px 12px",
            background: "#F6F5F4",
            borderRadius: RADIUS_STANDARD,
            lineHeight: 1.6,
          }}
        >
          ⚠ 上記の金額は概算参考値です。実際の補助金額は審査機関の判定により異なります。
        </p>
      )}

      {/* ── 2カラム: 左=次のステップ + 進捗 / 右=クイックアクション ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 280px",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* 左カラム */}
        <div>
          {/* 次のステップ */}
          <SectionTitle>次のステップ</SectionTitle>
          <div
            style={{
              background: "#FFFFFF",
              border: BORDER_WHISPER,
              borderRadius: RADIUS_CARD,
              boxShadow: SHADOW_CARD,
              overflow: "hidden",
              marginBottom: 24,
            }}
          >
            {steps.map((item, i) => (
              <Link
                key={item.step}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 18px",
                  borderBottom: i < steps.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none",
                  fontSize: 14,
                  fontWeight: 400,
                  color: item.done ? "#9CA3AF" : "#1A1A1A",
                  textDecoration: "none",
                  transition: "background 0.15s",
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 500,
                    flexShrink: 0,
                    background: item.done ? "#0D9488" : "rgba(0,0,0,0.08)",
                    color: item.done ? "#fff" : "#6B6B7B",
                  }}
                >
                  {item.done ? "✓" : item.step}
                </span>
                <span
                  style={{
                    flex: 1,
                    textDecoration: item.done ? "line-through" : "none",
                    opacity: item.done ? 0.5 : 1,
                  }}
                >
                  {item.label}
                </span>
                {!item.done && (
                  <span style={{ fontSize: 12, color: "#0D9488", fontWeight: 500 }}>→</span>
                )}
              </Link>
            ))}
          </div>

          {/* ウィザード進捗バー（開始済みの場合） */}
          {wizardStep >= 1 && (
            <div
              style={{
                background: "#FFFFFF",
                border: BORDER_WHISPER,
                borderRadius: RADIUS_CARD,
                boxShadow: SHADOW_CARD,
                padding: 20,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#1E3A5F" }}>
                  ウィザード進行状況
                </span>
                <span style={{ fontSize: 12, color: "#6B6B7B" }}>
                  Step {wizardStep} / 6（{progressPct}%）
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 99, background: "rgba(0,0,0,0.06)" }}>
                <div
                  style={{
                    height: "100%",
                    borderRadius: 99,
                    background: "#0D9488",
                    width: `${progressPct}%`,
                    transition: "width 0.4s",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 右カラム: クイックアクション */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SectionTitle>クイックアクション</SectionTitle>

          {/* プライマリCTA */}
          <Link
            href="/my/wizard"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              padding: "12px 16px",
              borderRadius: RADIUS_STANDARD,
              fontSize: 14,
              fontWeight: 500,
              background: "#0D9488",
              color: "#fff",
              textDecoration: "none",
              boxShadow: "rgba(13,82,95,0.15) 0px 8px 20px -8px, rgba(0,0,0,0.06) 0px 4px 8px -4px",
              transition: "all 0.2s",
            }}
          >
            📝 {wizardStep >= 1 ? "ウィザードを続ける" : "新規申請を始める"}
          </Link>

          {/* セカンダリリンク */}
          <ActionLink href="/match" icon="⚡" label="AI診断を受ける" />
          <ActionLink href="/my/wizard" icon="📋" label="見積もり・書類ウィザード" />
          <ActionLink href="/partners/multik" icon="🔧" label="工事業者を探す" />

          {/* 施工相談カード */}
          <div
            style={{
              marginTop: 6,
              padding: "16px",
              background: "rgba(13,148,136,0.04)",
              border: "1px solid rgba(13,148,136,0.15)",
              borderRadius: RADIUS_CARD,
              fontSize: 13,
              color: "#1A1A1A",
              lineHeight: 1.7,
            }}
          >
            <p style={{ fontWeight: 500, marginBottom: 4, fontSize: 13 }}>
              🔧 施工・詳細見積もりのご相談
            </p>
            <p style={{ color: "#6B6B7B", marginBottom: 10, fontSize: 12, lineHeight: 1.6 }}>
              施工依頼・詳細見積もりのご相談は、お問い合わせフォームからどうぞ。
            </p>
            <Link
              href="/contact"
              style={{
                fontSize: 13,
                color: "#0D9488",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              お問い合わせフォームへ →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── サブコンポーネント ── */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily: "'Noto Sans JP', sans-serif",
        fontSize: 14,
        fontWeight: 500,
        color: "#1E3A5F",
        marginBottom: 12,
        letterSpacing: 0,
      }}
    >
      {children}
    </h2>
  );
}

function SummaryCard({
  value,
  label,
  sub,
  color,
  active,
}: {
  value: string;
  label: string;
  sub: string;
  color: string;
  active: boolean;
}) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: BORDER_WHISPER,
        borderRadius: RADIUS_CARD,
        boxShadow: SHADOW_CARD,
        padding: "20px 16px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 22,
          fontWeight: 700,
          color: active ? color : "#9CA3AF",
          marginBottom: 4,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: "#6B6B7B", lineHeight: 1.5 }}>
        {label}
        <br />
        <span style={{ fontSize: 11, color: "#9CA3AF" }}>{sub}</span>
      </div>
    </div>
  );
}

function ActionLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px",
        borderRadius: RADIUS_STANDARD,
        fontSize: 13,
        fontWeight: 400,
        color: "#1A1A1A",
        background: "#FFFFFF",
        border: BORDER_WHISPER,
        textDecoration: "none",
        transition: "all 0.15s",
      }}
    >
      <span style={{ fontSize: 14 }}>{icon}</span>
      {label}
    </Link>
  );
}
