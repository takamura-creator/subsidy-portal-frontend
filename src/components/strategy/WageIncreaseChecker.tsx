"use client";

import { useState } from "react";
import {
  postWageCheck,
  type WageCheckResponse,
  type WageRuleId,
} from "@/lib/api";

const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];

const RULES: { id: WageRuleId; label: string }[] = [
  { id: "monodukuri_basic", label: "ものづくり補助金（基本要件）" },
  { id: "monodukuri_bonus", label: "ものづくり補助金（加点上位）" },
  { id: "digital_ai_returning", label: "デジタル化・AI（過去受給歴あり）" },
  { id: "digital_ai_new", label: "デジタル化・AI（新規）" },
];

const CATEGORY_BADGE: Record<string, { bg: string; fg: string; label: string }> = {
  mandatory: { bg: "var(--hc-error-subtle)", fg: "var(--hc-error)", label: "必須" },
  bonus: { bg: "var(--hc-primary-soft)", fg: "var(--hc-primary)", label: "加点" },
  recommended: { bg: "var(--hc-accent-subtle)", fg: "var(--hc-accent)", label: "推奨" },
};

export default function WageIncreaseChecker() {
  const [ruleId, setRuleId] = useState<WageRuleId>("monodukuri_basic");
  const [prefecture, setPrefecture] = useState("東京都");
  const [currentPayroll, setCurrentPayroll] = useState<number>(5000);
  const [currentMinWage, setCurrentMinWage] = useState<number>(1163);
  const [staffCount, setStaffCount] = useState<number>(10);
  const [planYears, setPlanYears] = useState<number>(3);
  const [result, setResult] = useState<WageCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCheck() {
    setLoading(true);
    setError(null);
    try {
      const res = await postWageCheck({
        rule_id: ruleId,
        prefecture,
        current_total_payroll_man: currentPayroll,
        current_min_wage_yen: currentMinWage,
        staff_count: staffCount,
        plan_years: planYears,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "判定に失敗しました");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    color: "var(--hc-text)",
    marginBottom: 4,
  };
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "6px 8px",
    fontSize: 12,
    border: "1px solid var(--hc-border)",
    borderRadius: 6,
    background: "var(--hc-card-bg)",
  };

  return (
    <div
      style={{
        background: "var(--hc-card-bg)",
        border: "1px solid var(--hc-border)",
        borderRadius: 10,
        padding: 14,
      }}
    >
      <h3
        style={{
          fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
          fontSize: 14,
          fontWeight: 700,
          color: "var(--hc-navy)",
          margin: "0 0 10px",
        }}
      >
        📐 賃上げ要件チェッカー
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <div>
          <label style={labelStyle}>補助金種別</label>
          <select
            style={inputStyle}
            value={ruleId}
            onChange={(e) => setRuleId(e.target.value as WageRuleId)}
          >
            {RULES.map((r) => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>都道府県</label>
          <select
            style={inputStyle}
            value={prefecture}
            onChange={(e) => setPrefecture(e.target.value)}
          >
            {PREFECTURES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>現状の給与支給総額（万円/年）</label>
          <input
            type="number"
            min={0}
            style={inputStyle}
            value={currentPayroll}
            onChange={(e) => setCurrentPayroll(Number(e.target.value))}
          />
        </div>
        <div>
          <label style={labelStyle}>事業場内最低賃金（円/時）</label>
          <input
            type="number"
            min={0}
            style={inputStyle}
            value={currentMinWage}
            onChange={(e) => setCurrentMinWage(Number(e.target.value))}
          />
        </div>
        <div>
          <label style={labelStyle}>従業員数（人）</label>
          <input
            type="number"
            min={1}
            style={inputStyle}
            value={staffCount}
            onChange={(e) => setStaffCount(Number(e.target.value))}
          />
        </div>
        <div>
          <label style={labelStyle}>計画期間（年）</label>
          <input
            type="number"
            min={1}
            max={5}
            style={inputStyle}
            value={planYears}
            onChange={(e) => setPlanYears(Number(e.target.value))}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleCheck}
        disabled={loading}
        className="btn-primary"
        style={{
          padding: "8px 14px",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 700,
          width: "100%",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "判定中..." : "判定する"}
      </button>

      {error && (
        <div
          style={{
            marginTop: 10,
            padding: 8,
            fontSize: 11,
            color: "var(--hc-error)",
            background: "var(--hc-error-subtle)",
            border: "1px solid var(--hc-error)",
            borderRadius: 6,
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 12 }}>
          {result.warning_below_legal && (
            <div
              style={{
                padding: 8,
                marginBottom: 8,
                fontSize: 11,
                color: "var(--hc-error)",
                background: "var(--hc-error-subtle)",
                border: "1px solid var(--hc-error)",
                borderRadius: 6,
                fontWeight: 600,
              }}
            >
              ⚠ 法令違反リスク：現状の最低賃金が地域別最低賃金を下回っています。
            </div>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
              flexWrap: "wrap",
            }}
          >
            {(() => {
              const c = CATEGORY_BADGE[result.category] ?? CATEGORY_BADGE.recommended;
              return (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    background: c.bg,
                    color: c.fg,
                    padding: "2px 6px",
                    borderRadius: 4,
                  }}
                >
                  {c.label}
                </span>
              );
            })()}
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: result.overall_pass ? "var(--hc-success)" : "var(--hc-error)",
              }}
            >
              {result.overall_pass ? "✓ クリア" : "✗ 未達"}
            </span>
            <span style={{ fontSize: 11, color: "var(--hc-text-muted)" }}>
              {result.label}
            </span>
          </div>

          <table
            style={{
              width: "100%",
              fontSize: 11,
              borderCollapse: "collapse",
              marginBottom: 8,
            }}
          >
            <thead>
              <tr style={{ background: "var(--hc-bg-subtle)" }}>
                <th style={{ padding: 6, textAlign: "left", fontWeight: 600 }}>項目</th>
                <th style={{ padding: 6, textAlign: "right", fontWeight: 600 }}>判定</th>
                <th style={{ padding: 6, textAlign: "right", fontWeight: 600 }}>差分</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderTop: "1px solid var(--hc-border)" }}>
                <td style={{ padding: 6 }}>
                  給与支給総額 年率 {(result.required_payroll_increase_rate * 100).toFixed(1)}%
                </td>
                <td style={{ padding: 6, textAlign: "right", color: result.pass_payroll ? "var(--hc-success)" : "var(--hc-error)" }}>
                  {result.pass_payroll ? "✓" : "✗"}
                </td>
                <td style={{ padding: 6, textAlign: "right" }}>
                  +{result.gap_payroll_man.toLocaleString()}万円
                </td>
              </tr>
              <tr style={{ borderTop: "1px solid var(--hc-border)" }}>
                <td style={{ padding: 6 }}>
                  事業場内最低賃金 ≥ {result.required_min_wage_yen}円
                </td>
                <td style={{ padding: 6, textAlign: "right", color: result.pass_min_wage ? "var(--hc-success)" : "var(--hc-error)" }}>
                  {result.pass_min_wage ? "✓" : "✗"}
                </td>
                <td style={{ padding: 6, textAlign: "right" }}>
                  +{result.gap_min_wage_yen}円
                </td>
              </tr>
            </tbody>
          </table>

          {result.per_capita_increase_yen_month > 0 && (
            <p style={{ fontSize: 11, color: "var(--hc-text-muted)", margin: "4px 0" }}>
              従業員1人あたり月額 +¥{Math.round(result.per_capita_increase_yen_month).toLocaleString()} の昇給が必要
            </p>
          )}
          <p style={{ fontSize: 10, color: "var(--hc-text-subtle)", margin: 0 }}>
            数値根拠 last_verified: {result.last_verified}
          </p>
        </div>
      )}
    </div>
  );
}
