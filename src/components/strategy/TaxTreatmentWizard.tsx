"use client";

/**
 * TaxTreatmentWizard — 消費税課税区分判定ウィザード（Sprint 4）
 *
 * 完全決定論（AI不使用）。3問の決定木をステッパー型UIで提示。
 * バックエンド `POST /api/v1/strategy/tax-classify` を明示onClickで呼び出す。
 *
 * 仕様根拠:
 * - 製品責任者/出力/2026-05-05_subsidy_research_ui_spec/05_tax_wizard.md
 * - 財務責任者/出力/2026-05-05_tax_wage_logic.md §1
 *
 * AI関与なし徹底:
 * - useEffect 不使用（明示onClickでのみAPI呼出）
 * - @anthropic-ai/sdk import なし
 * - バックエンド側もJSONルール表ロード型で完全決定論
 */

import { useState } from "react";
import {
  postTaxClassify,
  type TaxClassifyQ1,
  type TaxClassifyQ2,
  type TaxClassifyQ3,
  type TaxClassifyRequest,
  type TaxClassifyResponse,
} from "@/lib/api";

// ── 計測フック（横断Analyticsへの繋ぎ込みは別タスク） ──
function logEvent(name: string, payload?: Record<string, unknown>) {
  if (typeof window !== "undefined") console.debug("[analytics]", name, payload ?? {});
}

// ── 質問定義（バックエンドenumと整合） ───────────────
type Q1Choice = { value: TaxClassifyQ1; label: string; help?: string };
type Q2Choice = { value: TaxClassifyQ2; label: string; help?: string };
type Q3Choice = { value: TaxClassifyQ3; label: string; help?: string };

const Q1_CHOICES: Q1Choice[] = [
  { value: "yes", label: "登録あり（T+13桁の登録番号を保有）" },
  { value: "no", label: "登録なし" },
  { value: "unknown", label: "わからない" },
];

const Q2_CHOICES: Q2Choice[] = [
  { value: "over", label: "1,000万円超" },
  { value: "under", label: "1,000万円以下" },
  { value: "unknown", label: "わからない" },
];

const Q3_CHOICES: Q3Choice[] = [
  { value: "simplified", label: "簡易課税の届出済" },
  { value: "two_pct", label: "2割特例の対象（インボイス開始に伴う特例）" },
  { value: "none", label: "一般課税（届出なし）" },
  { value: "unknown", label: "わからない" },
];

// ── 区分バッジの配色 ─────────────────────────────────
const CATEGORY_COLOR: Record<string, { bg: string; fg: string }> = {
  taxable_principle: { bg: "#DBEAFE", fg: "#1E40AF" },
  taxable_simplified: { bg: "#DCFCE7", fg: "#166534" },
  taxable_2pct: { bg: "#FEF3C7", fg: "#92400E" },
  exempt: { bg: "#F3E8FF", fg: "#6B21A8" },
  unknown: { bg: "#FEE2E2", fg: "#B91C1C" },
};

export default function TaxTreatmentWizard() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [q1, setQ1] = useState<TaxClassifyQ1 | "">("");
  const [q2, setQ2] = useState<TaxClassifyQ2 | "">("");
  const [q3, setQ3] = useState<TaxClassifyQ3 | "">("");
  const [openHelp, setOpenHelp] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<TaxClassifyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 「わからない」を含む場合は判定保留扱い（仕様§5・§8）
  const hasUnknown = q1 === "unknown" || q2 === "unknown" || q3 === "unknown";

  function gotoStep(next: 1 | 2 | 3 | 4) {
    setStep(next);
    logEvent("tax_wizard_step_change", { from: step, to: next });
  }

  function reset() {
    setStep(1);
    setQ1("");
    setQ2("");
    setQ3("");
    setResult(null);
    setError(null);
    setOpenHelp({});
    logEvent("tax_wizard_reset");
  }

  // ⚠ APIは明示onClickでのみ呼出（useEffect禁止）
  async function handleClassify() {
    if (!q1 || !q2 || !q3 || loading) return;
    setLoading(true);
    setError(null);
    logEvent("tax_wizard_classify_submit", { q1, q2, q3 });
    try {
      const body: TaxClassifyRequest = {
        q1_invoice_registered: q1,
        q2_taxable_sales_over_10m: q2,
        q3_simplified_tax_filed: q3,
      };
      const res = await postTaxClassify(body);
      setResult(res);
      gotoStep(4);
      logEvent("tax_wizard_classify_result", {
        category: res.tax_category,
        requires_expert_review: res.requires_expert_review,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "判定に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  function handlePdfSave() {
    logEvent("tax_wizard_pdf_save", { category: result?.tax_category });
    // PDF専用APIは未実装。横断タスクで差し替え。
    if (typeof window !== "undefined") window.print();
  }

  return (
    <div style={wrap}>
      <Stepper step={step} />

      {/* AI不使用バナー */}
      <div style={aiNotice} role="note">
        🛡️ 本ウィザードはAIを使用しません（決定論計算のみ）。最終判定は税理士または所管税務署にご確認ください。
      </div>

      {step === 1 && (
        <QuestionCard
          title="Q1. 適格請求書発行事業者（インボイス）の登録状況"
          stepLabel="1 / 3"
          helpKey="q1"
          helpOpen={!!openHelp.q1}
          onToggleHelp={() => setOpenHelp((s) => ({ ...s, q1: !s.q1 }))}
          helpText="国税庁発行の登録番号（T+13桁）を保有していればA。事業者登録は税理士事務所や顧問契約先で確認できます。"
        >
          {Q1_CHOICES.map((c) => (
            <RadioRow
              key={c.value}
              name="q1"
              checked={q1 === c.value}
              label={c.label}
              onChange={() => setQ1(c.value)}
            />
          ))}
          <NavRow>
            <button
              type="button"
              style={{ ...btnPrimary, opacity: q1 ? 1 : 0.4 }}
              disabled={!q1}
              onClick={() => gotoStep(2)}
            >
              次へ →
            </button>
          </NavRow>
        </QuestionCard>
      )}

      {step === 2 && (
        <QuestionCard
          title="Q2. 直近事業年度の課税売上高（基準年度2年前）"
          stepLabel="2 / 3"
          helpKey="q2"
          helpOpen={!!openHelp.q2}
          onToggleHelp={() => setOpenHelp((s) => ({ ...s, q2: !s.q2 }))}
          helpText="基準年度（2年前）の課税売上高で判定します。1,000万円が課税事業者・免税事業者の境界です。金額本体はサーバに送信されません（プライバシー保護）。"
        >
          {Q2_CHOICES.map((c) => (
            <RadioRow
              key={c.value}
              name="q2"
              checked={q2 === c.value}
              label={c.label}
              onChange={() => setQ2(c.value)}
            />
          ))}
          <NavRow>
            <button type="button" style={btnSecondary} onClick={() => gotoStep(1)}>
              ← 戻る
            </button>
            <button
              type="button"
              style={{ ...btnPrimary, opacity: q2 ? 1 : 0.4 }}
              disabled={!q2}
              onClick={() => gotoStep(3)}
            >
              次へ →
            </button>
          </NavRow>
        </QuestionCard>
      )}

      {step === 3 && (
        <QuestionCard
          title="Q3. 簡易課税制度・2割特例の届出状況"
          stepLabel="3 / 3"
          helpKey="q3"
          helpOpen={!!openHelp.q3}
          onToggleHelp={() => setOpenHelp((s) => ({ ...s, q3: !s.q3 }))}
          helpText="簡易課税制度選択届出書の提出済はA。インボイス開始に伴う2割特例の対象事業者はB。届出なしの場合は一般課税。"
        >
          {Q3_CHOICES.map((c) => (
            <RadioRow
              key={c.value}
              name="q3"
              checked={q3 === c.value}
              label={c.label}
              onChange={() => setQ3(c.value)}
            />
          ))}
          {hasUnknown && (
            <div style={warnBox} role="note">
              ⚠ いずれかの設問で「わからない」が選択されています。判定は「保留」扱いとなり、
              <strong>税理士確認を推奨</strong>します。
            </div>
          )}
          <NavRow>
            <button type="button" style={btnSecondary} onClick={() => gotoStep(2)}>
              ← 戻る
            </button>
            <button
              type="button"
              style={{
                ...btnPrimary,
                opacity: q1 && q2 && q3 && !loading ? 1 : 0.4,
                cursor: q1 && q2 && q3 && !loading ? "pointer" : "not-allowed",
              }}
              disabled={!q1 || !q2 || !q3 || loading}
              onClick={handleClassify}
            >
              {loading ? "判定中..." : "判定する"}
            </button>
          </NavRow>
          {error && <div role="alert" style={errBox}>{error}</div>}
        </QuestionCard>
      )}

      {step === 4 && result && (
        <ResultCard result={result} onReset={reset} onPdf={handlePdfSave} />
      )}
    </div>
  );
}

// ====== サブ部品 ======

function Stepper({ step }: { step: 1 | 2 | 3 | 4 }) {
  const labels = ["Q1 インボイス", "Q2 売上規模", "Q3 課税方式", "結果"];
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      {labels.map((label, i) => {
        const idx = i + 1;
        const active = idx === step;
        const done = idx < step;
        return (
          <div key={label} style={{ flex: 1, textAlign: "center" }}>
            <div
              style={{
                height: 4,
                borderRadius: 2,
                background: done ? "#2563EB" : active ? "#93C5FD" : "#E5E7EB",
                marginBottom: 4,
              }}
            />
            <span style={{ fontSize: 11, color: active ? "#111827" : "#6B7280", fontWeight: active ? 700 : 500 }}>
              {idx}/4 {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function QuestionCard({
  title,
  stepLabel,
  helpKey: _helpKey,
  helpOpen,
  onToggleHelp,
  helpText,
  children,
}: {
  title: string;
  stepLabel: string;
  helpKey: string;
  helpOpen: boolean;
  onToggleHelp: () => void;
  helpText: string;
  children: React.ReactNode;
}) {
  return (
    <div style={card}>
      <div style={{ fontSize: 11, color: "#6B7280", marginBottom: 4 }}>{stepLabel}</div>
      <h2 style={h2}>{title}</h2>
      <div style={{ marginTop: 8 }}>{children}</div>
      <button type="button" onClick={onToggleHelp} style={accordionBtn}>
        {helpOpen ? "▼ 補足を閉じる" : "▶ 補足を見る"}
      </button>
      {helpOpen && <div style={helpBox}>{helpText}</div>}
    </div>
  );
}

function RadioRow({
  name,
  checked,
  label,
  onChange,
}: {
  name: string;
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 12px",
        marginBottom: 6,
        border: `1px solid ${checked ? "#2563EB" : "#E5E7EB"}`,
        borderRadius: 8,
        background: checked ? "#EFF6FF" : "#fff",
        cursor: "pointer",
        fontSize: 13,
      }}
    >
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        style={{ margin: 0 }}
      />
      <span>{label}</span>
    </label>
  );
}

function NavRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
      {children}
    </div>
  );
}

function ResultCard({
  result,
  onReset,
  onPdf,
}: {
  result: TaxClassifyResponse;
  onReset: () => void;
  onPdf: () => void;
}) {
  const color = CATEGORY_COLOR[result.tax_category] ?? CATEGORY_COLOR.unknown;
  const isHold = result.tax_category === "unknown" || result.requires_expert_review;
  return (
    <div style={card} aria-live="polite">
      <h2 style={h2}>📐 課税区分判定結果</h2>
      <div
        style={{
          display: "inline-block",
          padding: "8px 14px",
          background: color.bg,
          color: color.fg,
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        {isHold ? "⚠ 判定保留 — 税理士確認推奨" : result.label}
      </div>

      <dl style={{ margin: 0, fontSize: 13, color: "#111827" }}>
        <Row label="区分ラベル" value={result.label} />
        <Row label="補助対象金額の基準" value="税抜金額（消費税は補助対象外）" />
        <Row label="消費税還付義務" value={result.vat_refund_obligation ? "あり（要返還手続き）" : "なし"} />
        <Row label="申告区分" value={result.returns_obligation || "—"} />
        <Row label="返還要否" value={result.refund_required ? "要返還" : "返還不要"} />
      </dl>

      {result.explanation && (
        <p style={{ fontSize: 12, color: "#374151", marginTop: 12, padding: 8, background: "#F9FAFB", borderRadius: 6 }}>
          {result.explanation}
        </p>
      )}

      {isHold && (
        <div style={warnBox}>
          ⚠ 本ケースは決定木で確定できないか専門家確認が推奨されます。
          <a
            href="https://www.nta.go.jp/about/organization/access/zeimusho.htm"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1D4ED8", marginLeft: 4 }}
          >
            所管税務署を探す ↗
          </a>
        </div>
      )}

      <p style={{ fontSize: 11, color: "#6B7280", marginTop: 12 }}>
        最終判定は税理士または所管税務署にご確認ください。 / 検証 {result.last_verified}
      </p>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button type="button" style={btnSecondary} onClick={onReset}>もう一度判定する</button>
        <button type="button" style={btnPrimary} onClick={onPdf}>判定結果をPDF保存</button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", borderTop: "1px solid #E5E7EB", padding: "6px 0" }}>
      <dt style={{ width: 160, color: "#6B7280", fontSize: 12 }}>{label}</dt>
      <dd style={{ margin: 0, flex: 1 }}>{value}</dd>
    </div>
  );
}

// ====== styles ======

const wrap: React.CSSProperties = { maxWidth: 640, margin: "0 auto" };
const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: 10,
  padding: 16,
  marginBottom: 12,
};
const h2: React.CSSProperties = { fontSize: 16, fontWeight: 700, margin: "0 0 12px", color: "#111827" };
const btnPrimary: React.CSSProperties = {
  padding: "10px 16px",
  background: "#2563EB",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};
const btnSecondary: React.CSSProperties = {
  padding: "10px 14px",
  background: "#fff",
  color: "#374151",
  border: "1px solid #D1D5DB",
  borderRadius: 8,
  fontSize: 13,
  cursor: "pointer",
};
const accordionBtn: React.CSSProperties = {
  marginTop: 12,
  background: "transparent",
  border: "none",
  color: "#2563EB",
  fontSize: 12,
  padding: 0,
  cursor: "pointer",
};
const helpBox: React.CSSProperties = {
  marginTop: 6,
  padding: 8,
  background: "#F3F4F6",
  borderRadius: 6,
  fontSize: 12,
  color: "#374151",
  lineHeight: 1.6,
};
const warnBox: React.CSSProperties = {
  marginTop: 12,
  padding: 10,
  background: "#FEF3C7",
  border: "1px solid #FCD34D",
  borderRadius: 6,
  fontSize: 12,
  color: "#92400E",
};
const errBox: React.CSSProperties = {
  marginTop: 8,
  padding: 8,
  fontSize: 12,
  color: "#B91C1C",
  background: "#FEE2E2",
  border: "1px solid #FCA5A5",
  borderRadius: 6,
};
const aiNotice: React.CSSProperties = {
  padding: 10,
  marginBottom: 12,
  background: "#ECFDF5",
  border: "1px solid #A7F3D0",
  borderRadius: 8,
  fontSize: 12,
  color: "#065F46",
};
