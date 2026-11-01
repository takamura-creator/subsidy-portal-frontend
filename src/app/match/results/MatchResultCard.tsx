"use client";

/**
 * 診断結果1件描画コンポーネント。
 * F1: 上限額(目安)・補助率・締切残日数・対応可否の4点表示
 * F2: 高スコアのみ「交付決定前の発注は補助対象外」バナー
 * 景表法ガード: max_amount は13px上限維持 / formatRate は null空文字ガード / 注記常時表示
 */

import Link from "next/link";
import { getDaysUntil } from "@/lib/deadlineUtils";
import { isServicePrefecture } from "@/lib/constants";
// 2026-10-27: 補助率は 0〜1 の小数で届く。旧 @/lib/formatRate は「0.5〜0.75%」と出していたため一覧・詳細と同じ整形に揃える
import { formatRate, formatSubsidyAmount } from "@/lib/subsidyFormatters";
import { SCORE_STYLES } from "./states";
import CameraEligibilityNote from "@/components/subsidies/CameraEligibilityNote";
import IndirectApplicantNote from "@/components/subsidies/IndirectApplicantNote";
import MatchEvidence from "./MatchEvidence";
import type { MatchedSubsidy } from "@/lib/api";
import { canUseApplicationTools, displayMatchScore } from "@/lib/subsidyAttributes";

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

/** "2027-08-31" → "2027年8月31日"。読めなければ null */
function isoToJapanese(value: string | null | undefined): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  return m ? `${m[1]}年${Number(m[2])}月${Number(m[3])}日` : null;
}

export default function MatchResultCard({ item, prefecture }: Props) {
  const inServiceArea = isServicePrefecture(prefecture);
  // 受付前（来年度分）の制度は、事前相談・申込の締切まで出る（backend 2026-11-01 決定 1-A）。
  // 締切の欄は申請の締切ではなく事前相談・申込の締切を出す
  const consultationUntil =
    item.subsidy.status === "upcoming" ? isoToJapanese(item.subsidy.prior_consultation_until) : null;
  const { text: deadlineText, urgent, pastDue } = formatDeadline(consultationUntil ?? item.subsidy.deadline ?? "");
  // カメラ対象が未確認の制度は「高」と出さない（試験 [1-f][2]）
  const score = displayMatchScore(item.match_score, item.subsidy);
  const isHighScore = score === "高";
  // 直接申請できない制度・個人宅向けの制度は申請書作成を出さない（試験 [2-b]）
  const showApplicationButton = canUseApplicationTools(item.subsidy);

  const deadlineColor = pastDue
    ? "var(--hc-text-muted)"
    : urgent
      ? "var(--hc-accent)"
      : "var(--hc-navy)";

  const rateText = formatRate(item.subsidy.rate_min, item.subsidy.rate_max);

  return (
    <div
      style={{
        background: "var(--hc-white)",
        border: "1px solid var(--hc-border)",
        borderRadius: 10,
        padding: 18,
        marginBottom: 10,
        boxShadow: "var(--hc-shadow)",
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
        className="match-card-grid"
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
            fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
            fontSize: 14,
            fontWeight: 700,
            flexShrink: 0,
            ...(SCORE_STYLES[score] ?? SCORE_STYLES["低"]),
          }}
        >
          {score}
        </div>

        {/* 制度情報 */}
        <div style={{ minWidth: 0 }}>
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
            {/* 上限額（目安）— 13px上限維持・景表法ガード */}
            <div
              style={{
                flex: 1,
                minWidth: 80,
                padding: "6px 10px",
                borderRight: "1px solid var(--hc-border)",
              }}
            >
              <div style={{ fontSize: 10, color: "var(--hc-text-muted)", marginBottom: 2 }}>
                上限額（目安）
              </div>
              {/* max_amount: 13px上限。特大カウント禁止。0 は「都道府県・自治体ごとに異なる」 */}
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--hc-navy)",
                  fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
                }}
              >
                {formatSubsidyAmount(item.subsidy)}
              </div>
            </div>

            {/* 補助率 — nullガード付き */}
            <div
              style={{
                flex: 1,
                minWidth: 72,
                padding: "6px 10px",
                borderRight: "1px solid var(--hc-border)",
              }}
            >
              <div style={{ fontSize: 10, color: "var(--hc-text-muted)", marginBottom: 2 }}>
                補助率
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--hc-navy)",
                  fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
                }}
              >
                {rateText}
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
                {consultationUntil ? "事前相談の締切" : "締切"}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: deadlineColor,
                  fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
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

          {/* 受付前（来年度分）の制度の注記（2026-11-01 決定 1-A） */}
          {consultationUntil && (
            <p
              role="note"
              data-testid="upcoming-note"
              style={{
                margin: "0 0 10px",
                padding: "4px 8px",
                fontSize: 11,
                lineHeight: 1.6,
                color: "var(--hc-warning-text)",
                background: "var(--hc-warning-subtle)",
                borderRadius: 6,
              }}
            >
              受付前の制度です。{consultationUntil}までに、制度の窓口へ事前相談・申込をしてください。
            </p>
          )}

          {/* カメラ機器が補助対象と確認できない制度の注記（審査 F-[7]） */}
          <CameraEligibilityNote subsidy={item.subsidy} compact />

          {/* 直接申請できない制度の注記（上限額が自治体単位であることを読めるように・審査[3]） */}
          <IndirectApplicantNote subsidy={item.subsidy} />

          {/* 要件チェック（○／要確認）・合い具合の理由・根拠の引用・出典と最終確認日（2026-11-01 PR-3） */}
          <MatchEvidence item={item} />

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

          {/* 景表法注記 — 常時表示 */}
          <p className="mc-disclaimer">
            ※制度・条件により異なります。出典：公式資料。診断は目安です。
          </p>
        </div>

        {/* アクションボタン */}
        <div className="match-card-actions" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
          {showApplicationButton && (
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
          )}
        </div>
      </div>
    </div>
  );
}
