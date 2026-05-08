"use client";

/**
 * LossCalculator — 業種別 年間損失算出ツール（決定論）
 * - AI使用なし
 * - 業種・式は API（loss-calc）から取得した applicable_fields に従う
 */

import { useState } from "react";
import { postLossCalc, type LossCalcRequest, type LossCalcResponse, type StrategyIndustry } from "@/lib/api";

const INDUSTRIES: { value: StrategyIndustry; label: string }[] = [
  { value: "retail", label: "小売" },
  { value: "restaurant", label: "飲食" },
  { value: "hotel", label: "宿泊" },
  { value: "manufacturing", label: "製造" },
  { value: "construction", label: "建設" },
  { value: "transport", label: "運輸" },
  { value: "medical", label: "医療" },
  { value: "care", label: "介護" },
  { value: "education", label: "教育" },
  { value: "other_service", label: "その他サービス" },
];

function logEvent(name: string, payload?: Record<string, unknown>) {
  if (typeof window !== "undefined") console.debug("[analytics]", name, payload ?? {});
}

export default function LossCalculator() {
  const [industry, setIndustry] = useState<StrategyIndustry | "">("");
  const [annualRevenue, setAnnualRevenue] = useState<number>(5000);
  const [staffCount, setStaffCount] = useState<number>(5);
  const [theftLoss, setTheftLoss] = useState<number>(0);
  const [intrusionCount, setIntrusionCount] = useState<number>(0);
  const [disputeCount, setDisputeCount] = useState<number>(0);
  const [monitoringHours, setMonitoringHours] = useState<number>(0);
  const [hourlyWage, setHourlyWage] = useState<number>(1100);
  const [result, setResult] = useState<LossCalcResponse | null>(null);
  const [stale, setStale] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFormula, setShowFormula] = useState(false);

  const canCalc = !!industry && annualRevenue > 0 && staffCount > 0 && !loading;

  // ⚠ 明示トリガー（ボタンonClick）から計算API呼出。useEffect禁止。
  async function handleCalc() {
    if (!canCalc || !industry) return;
    setLoading(true);
    setError(null);
    logEvent("loss_calc_submit", { industry });
    try {
      const body: LossCalcRequest = {
        industry,
        annual_revenue_man: annualRevenue,
        staff_count: staffCount,
        theft_loss_man: theftLoss,
        unauthorized_entry_count: intrusionCount,
        claim_disputes_count: disputeCount,
        monitoring_hours_per_week: monitoringHours,
        hourly_wage_yen: hourlyWage,
      };
      const res = await postLossCalc(body);
      setResult(res);
      setStale(false);
      logEvent("loss_calc_success", { industry, total: res.total_annual_loss_yen });
    } catch (e) {
      setError(e instanceof Error ? e.message : "計算に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  // 入力変更時に既存結果を灰色化（再計算促し）
  function markStale<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      if (result) setStale(true);
    };
  }

  const fieldVisible = (key: string) =>
    !result?.applicable_fields || result.applicable_fields.length === 0
      ? true
      : result.applicable_fields.includes(key);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,420px) 1fr", gap: 24 }}>
      {/* 左：入力フォーム */}
      <div style={card}>
        <h2 style={h2}>📐 入力</h2>

        <Field label="業種 *">
          <select
            value={industry}
            onChange={(e) => markStale(setIndustry)(e.target.value as StrategyIndustry)}
            style={input}
            aria-label="業種"
          >
            <option value="">選択してください</option>
            {INDUSTRIES.map((i) => (
              <option key={i.value} value={i.value}>{i.label}</option>
            ))}
          </select>
        </Field>

        <Field label="年商（万円）*">
          <NumInput value={annualRevenue} min={100} max={1000000} onChange={markStale(setAnnualRevenue)} />
        </Field>
        <Field label="従業員数（人）*">
          <NumInput value={staffCount} min={1} max={10000} onChange={markStale(setStaffCount)} />
        </Field>

        {fieldVisible("theft_loss_man") && (
          <Field label="過去1年の盗難・万引き被害（万円）">
            <NumInput value={theftLoss} min={0} max={100000} onChange={markStale(setTheftLoss)} />
          </Field>
        )}
        {fieldVisible("unauthorized_entry_count") && (
          <Field label="過去1年の不正侵入回数">
            <NumInput value={intrusionCount} min={0} max={365} onChange={markStale(setIntrusionCount)} />
          </Field>
        )}
        {fieldVisible("claim_disputes_count") && (
          <Field label="過去1年のクレーム・水掛け論件数">
            <NumInput value={disputeCount} min={0} max={10000} onChange={markStale(setDisputeCount)} />
          </Field>
        )}
        {fieldVisible("monitoring_hours_per_week") && (
          <Field label="巡回・モニタリング時間（h/週）">
            <NumInput value={monitoringHours} min={0} max={168} onChange={markStale(setMonitoringHours)} />
          </Field>
        )}
        {fieldVisible("hourly_wage_yen") && (
          <Field label="平均時給（円）">
            <NumInput value={hourlyWage} min={800} max={10000} onChange={markStale(setHourlyWage)} />
          </Field>
        )}

        <button
          type="button"
          // ⚠ 計算は明示onClickから（自動呼出禁止）
          onClick={handleCalc}
          disabled={!canCalc}
          title={!canCalc ? "すべての必須項目を入力してください" : undefined}
          style={{
            ...btnPrimary,
            opacity: canCalc ? 1 : 0.4,
            cursor: canCalc ? "pointer" : "not-allowed",
          }}
        >
          {loading ? "計算中..." : "計算する"}
        </button>

        {error && (
          <div role="alert" style={errBox}>{error}</div>
        )}
      </div>

      {/* 右：結果カード */}
      <div>
        {!result ? (
          <div style={{ ...card, color: "#6B7280", textAlign: "center", padding: 32 }}>
            業種と数値を入力すると損失額を試算します
          </div>
        ) : (
          <div
            aria-live="polite"
            style={{
              ...card,
              opacity: stale ? 0.5 : 1,
              filter: stale ? "grayscale(0.6)" : "none",
            }}
          >
            <h2 style={h2}>📐 年間損失試算</h2>
            {stale && (
              <p style={{ color: "#B45309", fontSize: 12, margin: "0 0 8px" }}>
                ⚠ 入力が変更されました。再計算してください。
              </p>
            )}
            <p style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: "8px 0" }}>
              ¥{result.total_annual_loss_yen.toLocaleString()}
            </p>
            <p style={{ fontSize: 12, color: "#6B7280", margin: "0 0 12px" }}>
              年商比 {(result.loss_ratio * 100).toFixed(1)}% が損失として失われています
            </p>

            <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F9FAFB" }}>
                  <th style={th}>項目</th>
                  <th style={{ ...th, textAlign: "right" }}>金額（円）</th>
                </tr>
              </thead>
              <tbody>
                <Row label="直接損失（盗難・万引き）" value={result.breakdown.direct_loss_yen} />
                <Row label="労務損失（巡回・監視）" value={result.breakdown.labor_loss_yen} />
                <Row label="紛争コスト（クレーム対応）" value={result.breakdown.dispute_cost_yen} />
                <Row label="侵入損失" value={result.breakdown.intrusion_cost_yen} />
              </tbody>
            </table>

            <button
              type="button"
              onClick={() => setShowFormula((v) => !v)}
              style={{ ...btnSecondary, marginTop: 12 }}
            >
              {showFormula ? "計算式を閉じる" : "計算式を見る"}
            </button>
            {showFormula && (
              <pre
                style={{
                  marginTop: 8,
                  padding: 8,
                  background: "#F3F4F6",
                  borderRadius: 4,
                  fontSize: 11,
                  whiteSpace: "pre-wrap",
                }}
              >
                {result.formula_text}
              </pre>
            )}

            <p style={{ fontSize: 10, color: "#9CA3AF", marginTop: 8 }}>
              テンプレ {result.template_version} / 検証 {result.last_verified}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ====== サブ部品 ======

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function NumInput({
  value, min, max, onChange,
}: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={input}
    />
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <tr style={{ borderTop: "1px solid #E5E7EB" }}>
      <td style={{ padding: 6 }}>{label}</td>
      <td style={{ padding: 6, textAlign: "right" }}>¥{value.toLocaleString()}</td>
    </tr>
  );
}

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: 10,
  padding: 16,
};
const h2: React.CSSProperties = { fontSize: 16, fontWeight: 700, margin: "0 0 12px", color: "#111827" };
const input: React.CSSProperties = {
  width: "100%", padding: "6px 8px", fontSize: 13, border: "1px solid #D1D5DB", borderRadius: 6, background: "#fff",
};
const th: React.CSSProperties = { padding: 6, fontSize: 11, textAlign: "left", fontWeight: 600 };
const btnPrimary: React.CSSProperties = {
  width: "100%", padding: "10px 16px", background: "#2563EB", color: "#fff",
  border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, marginTop: 8,
};
const btnSecondary: React.CSSProperties = {
  padding: "6px 10px", background: "#fff", color: "#374151",
  border: "1px solid #D1D5DB", borderRadius: 6, fontSize: 12, cursor: "pointer",
};
const errBox: React.CSSProperties = {
  marginTop: 8, padding: 8, fontSize: 12, color: "#B91C1C",
  background: "#FEE2E2", border: "1px solid #FCA5A5", borderRadius: 6,
};
