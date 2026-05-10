"use client";

import { useState } from "react";
import {
  postPrecommencementCheck,
  type PrecommencementResponse,
} from "@/lib/api";

const SEVERITY_STYLE: Record<string, { bg: string; border: string; fg: string }> = {
  ok: { bg: "var(--hc-primary-soft)", border: "var(--hc-success)", fg: "var(--hc-success)" },
  warning: {
    bg: "var(--hc-accent-subtle)",
    border: "var(--hc-accent)",
    fg: "var(--hc-accent)",
  },
  critical: {
    bg: "var(--hc-error-subtle)",
    border: "var(--hc-error)",
    fg: "var(--hc-error)",
  },
};

export default function PrecommencementWarning() {
  const [grantDecisionDate, setGrantDecisionDate] = useState<string>("");
  const [plannedDate, setPlannedDate] = useState<string>("");
  const [result, setResult] = useState<PrecommencementResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCheck() {
    if (!plannedDate) {
      setError("着手予定日を入力してください");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await postPrecommencementCheck({
        grant_decision_date: grantDecisionDate || null,
        planned_commencement_date: plannedDate,
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

  const style = result ? SEVERITY_STYLE[result.severity] ?? SEVERITY_STYLE.warning : null;

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
          fontFamily: "'Sora', sans-serif",
          fontSize: 14,
          fontWeight: 700,
          color: "var(--hc-navy)",
          margin: "0 0 10px",
        }}
      >
        🛑 事前着手日チェック
      </h3>

      <p style={{ fontSize: 11, color: "var(--hc-text-muted)", margin: "0 0 8px" }}>
        交付決定通知より前の発注・契約・支払は補助対象外（事前着手）になります。
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <div>
          <label style={labelStyle}>交付決定日（未確定なら空欄）</label>
          <input
            type="date"
            style={inputStyle}
            value={grantDecisionDate}
            onChange={(e) => setGrantDecisionDate(e.target.value)}
          />
        </div>
        <div>
          <label style={labelStyle}>着手予定日</label>
          <input
            type="date"
            style={inputStyle}
            value={plannedDate}
            onChange={(e) => setPlannedDate(e.target.value)}
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
        {loading ? "判定中..." : "事前着手リスクを判定"}
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

      {result && style && (
        <div
          style={{
            marginTop: 12,
            padding: 10,
            background: style.bg,
            border: `1px solid ${style.border}`,
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          <div style={{ color: style.fg, fontWeight: 700, marginBottom: 4 }}>
            {result.is_safe ? "✓ 安全" : "⚠ リスクあり"}　[{result.severity}]
          </div>
          <p style={{ margin: "0 0 6px", color: "var(--hc-text)" }}>
            {result.message}
          </p>
          <p style={{ margin: 0, fontSize: 11, color: "var(--hc-text-muted)" }}>
            {result.recommendation}
          </p>
          {result.days_diff !== null && (
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 10,
                color: "var(--hc-text-subtle)",
              }}
            >
              交付決定 → 着手 までの日数: {result.days_diff}日
            </p>
          )}
        </div>
      )}
    </div>
  );
}
