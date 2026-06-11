"use client";

/**
 * 診断結果1件描画コンポーネント。
 * F1: 最大額・締切残日数・対応可否の3点表示
 * F2: 高スコアのみ「交付決定前の発注は補助対象外」バナー
 */

import Link from "next/link";
import { getDaysUntil } from "@/lib/deadlineUtils";
import { isServicePrefecture } from "@/lib/constants";
import { SCORE_STYLES } from "./states";
import type { MatchedSubsidy } from "@/lib/api";

interface Props {
  item: MatchedSubsidy;
  prefecture: string;
}

/** 締切文字列を表示テキストと強調フラグに変換 */
function formatDeadline(deadline: string): { text: string; urgent: boolean; pastDue: boolean } {
  if (!deadline) return { text: "締切日未定", urgent: false, pastDue: false };
  const days = getDaysUntil(deadline);
  if (days === null) return { text: deadline, urgent: false, pastDue: false };
  if (days <= 0) return { text: "締切済みの可能性", urgent: false, pastDue: true };
  return { text: `あと ${days} 日`, urgent: days <= 31, pastDue: false };
}

export default function MatchResultCard({ item, prefecture }: Props) {
  const inServiceArea = isServicePrefecture(prefecture);
  const { text: deadlineText, urgent, pastDue } = formatDeadline(item.subsidy.deadline ?? "");
  const isHighScore = item.match_score === "高";

  const deadlineColor = pastDue
    ? "var(--hc-text-muted)"
    : urgent
      ? "var(--hc-accent)"
      : "var(--hc-navy)";

  return (
    <div
      style={{
        background: "var(--hc-card-bg)",
        border: "1px solid var(--hc-border)",
        borderRadius: 10,
        padding: 18,
        marginBottom: 10,
      }}
    >
      {/* F2: 高スコアのみ表示する交付決定前警告バナー */}
      {isHighScore && (
        <div
          role="note"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 10px",
            marginBottom: 12,
            background: "var(--hc-accent-subtle)",
            border: "1px solid var(--hc-accent-edge, var(--hc-accent))",
            borderRadius: 6,
            fontSize: 11,
            color: "var(--hc-accent)",
            fontWeight: 500,
          }}
        >
          <span aria-hidden="true">⚠</span>
          交付決定前の発注・契約は補助対象外になります
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "60px 1fr auto",
          gap: 14,
          alignItems: "center",
        }}
      >
        {/* マッチスコアサークル */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Sora', sans-serif",
            fontSize: 14,
            fontWeight: 700,
            flexShrink: 0,
            ...(SCORE_STYLES[item.match_score] ?? SCORE_STYLES["低"]),
          }}
        >
          {item.match_score}
        </div>

        {/* 制度情報 */}
        <div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--hc-navy)",
              marginBottom: 8,
            }}
          >
            {item.subsidy.name}
          </div>

          {/* F1: 3点即答セル（最大額 / 締切 / 対応可否） */}
          <div
            style={{
              display: "flex",
              gap: 0,
              flexWrap: "wrap",
              border: "1px solid var(--hc-border)",
              borderRadius: 6,
              overflow: "hidden",
              marginBottom: 6,
            }}
          >
            {/* 最大額 */}
            <div
              style={{
                flex: 1,
                minWidth: 80,
                padding: "6px 10px",
                borderRight: "1px solid var(--hc-border)",
              }}
            >
              <div style={{ fontSize: 10, color: "var(--hc-text-muted)", marginBottom: 2 }}>
                最大額
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--hc-navy)",
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                {(item.subsidy.max_amount / 10000).toLocaleString()}万円
              </div>
            </div>

            {/* 締切残日数 */}
            <div
              style={{
                flex: 1,
                minWidth: 80,
                padding: "6px 10px",
                borderRight: "1px solid var(--hc-border)",
              }}
            >
              <div style={{ fontSize: 10, color: "var(--hc-text-muted)", marginBottom: 2 }}>
                締切
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: deadlineColor,
                  fontFamily: "'Sora', sans-serif",
                }}
              >
                {deadlineText}
              </div>
            </div>

            {/* 対応可否 */}
            <div style={{ flex: 1, minWidth: 80, padding: "6px 10px" }}>
              <div style={{ fontSize: 10, color: "var(--hc-text-muted)", marginBottom: 2 }}>
                エリア
              </div>
              <div
                style={{
                  display: "inline-block",
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "1px 8px",
                  borderRadius: 9999,
                  background: inServiceArea
                    ? "var(--hc-primary-soft)"
                    : "var(--hc-text-subtle)",
                  color: inServiceArea
                    ? "var(--hc-success)"
                    : "var(--hc-text-muted)",
                }}
              >
                {inServiceArea ? "◎ 対応エリア" : "○ エリア外"}
              </div>
            </div>
          </div>

          {/* 省庁・アドバイス */}
          {item.application_advice && (
            <p
              style={{
                fontSize: 11,
                color: "var(--hc-text-muted)",
                marginTop: 4,
                lineHeight: 1.5,
              }}
            >
              {item.application_advice}
            </p>
          )}
        </div>

        {/* アクションボタン */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Link
            href={`/subsidies/${encodeURIComponent(item.subsidy.id)}`}
            className="btn-primary"
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 600,
              width: "auto",
              border: "1px solid var(--hc-primary)",
            }}
          >
            詳しく見る
          </Link>
          <button
            type="button"
            disabled
            className="btn-secondary"
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 600,
              display: "block",
              opacity: 0.6,
              cursor: "not-allowed",
            }}
            aria-label="申請書作成はウィザードから開始します"
          >
            申請書作成
          </button>
        </div>
      </div>
    </div>
  );
}
