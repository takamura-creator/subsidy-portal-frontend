"use client";

import { useState } from "react";
import { postDeductionCheck, type DeductionCheckResponse } from "@/lib/api";

const SEVERITY_STYLE: Record<string, { bg: string; border: string; fg: string }> = {
  critical: {
    bg: "var(--hc-error-subtle)",
    border: "var(--hc-error)",
    fg: "var(--hc-error)",
  },
  high: {
    bg: "var(--hc-accent-subtle)",
    border: "var(--hc-accent)",
    fg: "var(--hc-accent)",
  },
  medium: {
    bg: "var(--hc-bg-subtle)",
    border: "var(--hc-border)",
    fg: "var(--hc-text)",
  },
  low: {
    bg: "var(--hc-primary-soft)",
    border: "var(--hc-success)",
    fg: "var(--hc-success)",
  },
};

export default function DeductionWarning() {
  const [pastGrants, setPastGrants] = useState<number>(0);
  const [prevWageFailed, setPrevWageFailed] = useState(false);
  const [bonusWageFailed18m, setBonusWageFailed18m] = useState(false);
  const [otherStage, setOtherStage] = useState<number>(0);
  const [result, setResult] = useState<DeductionCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCheck() {
    setLoading(true);
    setError(null);
    try {
      const res = await postDeductionCheck({
        past_grants_3y_count: pastGrants,
        previous_wage_target_failed: prevWageFailed,
        bonus_wage_failed_within_18m: bonusWageFailed18m,
        other_subsidy_progress_stage: otherStage,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "診断に失敗しました");
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
    background: "var(--hc-white)",
  };

  const overallStyle = result
    ? SEVERITY_STYLE[result.risk_level] ?? SEVERITY_STYLE.medium
    : null;

  return (
    <div
      style={{
        background: "var(--hc-white)",
        border: "1px solid var(--hc-border)",
        borderRadius: 10,
        padding: 14,
      }}
    >
      <h3
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 14,
          fontWeight: 700,
          color: "var(--hc-navy)",
          margin: "0 0 10px",
        }}
      >
        ⚠ 減点リスク診断（4大項目）
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <div>
          <label style={labelStyle}>過去3年の同種補助金 交付決定回数</label>
          <input
            type="number"
            min={0}
            max={20}
            style={inputStyle}
            value={pastGrants}
            onChange={(e) => setPastGrants(Number(e.target.value))}
          />
        </div>
        <div>
          <label style={labelStyle}>他補助事業の進捗ステージ（0=該当なし）</label>
          <input
            type="number"
            min={0}
            max={10}
            style={inputStyle}
            value={otherStage}
            onChange={(e) => setOtherStage(Number(e.target.value))}
          />
        </div>
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          margin: "6px 0",
        }}
      >
        <input
          type="checkbox"
          checked={prevWageFailed}
          onChange={(e) => setPrevWageFailed(e.target.checked)}
        />
        前回補助事業で賃上げ要件未達だった
      </label>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 12,
          margin: "6px 0 10px",
        }}
      >
        <input
          type="checkbox"
          checked={bonusWageFailed18m}
          onChange={(e) => setBonusWageFailed18m(e.target.checked)}
        />
        賃上げ加点取得後18ヶ月以内に未達があった
      </label>

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
        {loading ? "診断中..." : "減点リスクを診断する"}
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

      {result && overallStyle && (
        <div style={{ marginTop: 12 }}>
          <div
            style={{
              padding: 8,
              marginBottom: 8,
              background: overallStyle.bg,
              border: `1px solid ${overallStyle.border}`,
              borderRadius: 6,
              fontSize: 12,
              color: overallStyle.fg,
              fontWeight: 700,
            }}
          >
            総合リスク：{result.risk_level.toUpperCase()}
            {result.blocking && "（申請不可レベル）"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {result.flags.map((f) => {
              const s = SEVERITY_STYLE[f.severity] ?? SEVERITY_STYLE.medium;
              return (
                <div
                  key={f.id}
                  style={{
                    padding: 8,
                    fontSize: 11,
                    background: f.matched ? s.bg : "var(--hc-white)",
                    border: f.matched
                      ? `1px solid ${s.border}`
                      : "1px solid var(--hc-border)",
                    borderRadius: 6,
                    opacity: f.matched ? 1 : 0.7,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 6,
                    }}
                  >
                    <span style={{ fontWeight: 700, color: "var(--hc-navy)" }}>
                      {f.matched ? "⚠" : "✓"} {f.id}：{f.name}
                    </span>
                    <span style={{ fontSize: 10, color: s.fg, fontWeight: 600 }}>
                      {f.severity}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: "4px 0 0",
                      color: "var(--hc-text-muted)",
                      lineHeight: 1.5,
                    }}
                  >
                    {f.rule}
                  </p>
                  {f.matched && f.detail && (
                    <p
                      style={{
                        margin: "4px 0 0",
                        color: s.fg,
                        fontWeight: 600,
                      }}
                    >
                      該当：{f.detail}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 10, color: "var(--hc-text-subtle)", marginTop: 6 }}>
            ルール last_verified: {result.last_verified}
          </p>
        </div>
      )}
    </div>
  );
}
