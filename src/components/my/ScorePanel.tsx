"use client";

import { useEffect } from "react";
import { useScore } from "@/lib/useScore";

interface Props {
  appId: string;
  subsidyId: string;
}

/**
 * Sprint 7 Phase D: 採択スコアパネル（5段階ゲージ）
 */
export default function ScorePanel({ appId, subsidyId }: Props) {
  const { score, loading, error, evaluate } = useScore();

  useEffect(() => {
    evaluate(appId, subsidyId);
  }, [appId, subsidyId, evaluate]);

  const containerStyle: React.CSSProperties = {
    background: "var(--hc-white)",
    border: "1px solid var(--hc-border)",
    borderRadius: 8,
    padding: "14px 16px",
    marginBottom: 20,
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: "'Sora', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    color: "var(--hc-navy)",
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={titleStyle}>📊 採択スコア</div>
        <div style={{ color: "var(--hc-text-muted)", fontSize: 12 }}>
          スコアを算出中...
        </div>
      </div>
    );
  }

  if (error || !score) {
    return (
      <div style={containerStyle}>
        <div style={titleStyle}>📊 採択スコア</div>
        <div style={{ color: "var(--hc-text-muted)", fontSize: 12 }}>
          スコアを取得できませんでした
        </div>
      </div>
    );
  }

  const totalScore = score.score_breakdown.reduce((sum, b) => sum + b.score, 0);
  const maxScore = score.score_breakdown.reduce((sum, b) => sum + b.max, 0);
  const pct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  // 5段階ゲージ色
  const gaugeColor =
    pct >= 80
      ? "var(--hc-success)"
      : pct >= 60
        ? "var(--hc-accent)"
        : pct >= 40
          ? "#f59e0b"
          : "var(--hc-error)";

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>
        📊 採択スコア
        <span
          style={{
            fontSize: 11,
            color: "var(--hc-text-muted)",
            fontWeight: 400,
          }}
        >
          （{score.confidence_level}）
        </span>
      </div>

      {/* ゲージ */}
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 700, color: gaugeColor }}>
            {totalScore}
          </span>
          <span style={{ fontSize: 12, color: "var(--hc-text-muted)" }}>
            / {maxScore} 点
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: 8,
            background: "var(--hc-text-divider)",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: gaugeColor,
              borderRadius: 4,
              transition: "width 0.4s ease",
            }}
          />
        </div>
        {/* 5段階目盛り */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 2,
            fontSize: 9,
            color: "var(--hc-text-muted)",
          }}
        >
          {[0, 25, 50, 75, 100].map((v) => (
            <span key={v}>{v}%</span>
          ))}
        </div>
      </div>

      {/* 内訳 */}
      <div style={{ marginBottom: 10 }}>
        {score.score_breakdown.map((b, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              padding: "3px 0",
              borderBottom:
                i < score.score_breakdown.length - 1
                  ? "1px solid var(--hc-border)"
                  : "none",
            }}
          >
            <span style={{ color: "var(--hc-text)", flex: 1 }}>
              {b.criterion}
            </span>
            <span
              style={{
                fontWeight: 600,
                color:
                  b.score === b.max ? "var(--hc-success)" : "var(--hc-accent)",
                marginLeft: 8,
              }}
            >
              {b.score}/{b.max}
            </span>
          </div>
        ))}
      </div>

      {/* フィードバック */}
      {score.feedback.length > 0 && (
        <div
          style={{
            background: "var(--hc-accent-light)",
            borderRadius: 6,
            padding: "8px 10px",
          }}
        >
          {score.feedback.map((f, i) => (
            <div
              key={i}
              style={{
                fontSize: 11,
                color: "var(--hc-navy)",
                marginBottom: i < score.feedback.length - 1 ? 4 : 0,
              }}
            >
              • {f}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
