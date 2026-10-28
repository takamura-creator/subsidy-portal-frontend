"use client";

/**
 * 補助金一覧 カードグリッド（SubsidiesTable 置換）。
 * 件数+ソート行 + auto-fill カードグリッド（264px min・gap24）。
 * 景表法: 金額はCaption級・「上限額(目安)」・大型表示禁止。
 */

import Link from "next/link";
import type { Subsidy } from "@/lib/api";
import { getDaysUntil, isCtaActive } from "@/lib/deadlineUtils";
import CameraEligibilityNote from "@/components/subsidies/CameraEligibilityNote";
import IndirectApplicantNote from "@/components/subsidies/IndirectApplicantNote";
import { formatRate } from "@/lib/subsidyFormatters";
import { subsidyStatusBadgeText, subsidyStatusLabel } from "@/lib/subsidyStatus";
import { hasRegionalDeadlines, isRegionallyClosed, regionalLastDay } from "@/lib/subsidyAttributes";

/**
 * カードの受付状態の文言（2026-10-28 審査[2]）。都道府県ごとに受付終了日がある制度（業務改善助成金）は、
 * 都道府県で絞っていればその都道府県の最終受付日で決め、絞っていなければ「公募中」と言い切らない。
 */
function cardStatusText(s: Subsidy, prefecture: string): string {
  if (s.status === "open" && hasRegionalDeadlines(s)) {
    if (isRegionallyClosed(s, prefecture)) return `${subsidyStatusLabel("closed")}（${prefecture}）`;
    const last = regionalLastDay(s, prefecture);
    if (last) {
      const [, m, d] = last.split("-").map(Number);
      return `公募中・${prefecture}は${m}/${d}まで`;
    }
    return "公募中（都道府県ごとに受付終了あり）";
  }
  return subsidyStatusBadgeText(s.status, s.deadline, 30);
}

interface SubsidiesCardGridProps {
  sorted: Subsidy[];
  loading: boolean;
  sort: string;
  formatAmountDisplay: (s: Subsidy) => string;
  onSort: (v: string) => void;
  /** 都道府県の絞り込み（空=未指定）。都道府県ごとの受付終了日の判定に使う */
  prefecture?: string;
}

export default function SubsidiesCardGrid({
  sorted, loading, sort, formatAmountDisplay, onSort, prefecture = "",
}: SubsidiesCardGridProps) {
  return (
    <div style={{ minWidth: 0 }}>
      {/* 件数 + ソート行 */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
      }}>
        <span style={{ fontSize: 13, color: "var(--hc-text-muted)" }}>
          {loading ? "読み込み中..." : `${sorted.length}件の補助金`}
        </span>
        <select
          className="form-select"
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          aria-label="並び順"
          style={{ minWidth: 150, fontSize: 13 }}
        >
          <option value="deadline">締切が近い順</option>
          <option value="amount">金額が大きい順</option>
          <option value="new">新着順</option>
        </select>
      </div>

      {/* カードグリッド */}
      <div
        className="subsidies-cardgrid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(264px, 1fr))",
          gap: 24,
        }}
      >
        {sorted.map((s) => <SubsidyCard key={s.id} s={s} formatAmountDisplay={formatAmountDisplay} prefecture={prefecture} />)}
      </div>

      {/* 空状態 */}
      {sorted.length === 0 && !loading && (
        <div style={{
          textAlign: "center",
          padding: "56px 0",
          fontSize: 14,
          color: "var(--hc-text-muted)",
        }}>
          条件に合う補助金が見つかりませんでした
        </div>
      )}
    </div>
  );
}

function SubsidyCard({ s, formatAmountDisplay, prefecture }: {
  s: Subsidy;
  formatAmountDisplay: (s: Subsidy) => string;
  prefecture: string;
}) {
  const days = getDaysUntil(s.deadline);
  // H-3: open かつ deadline パース可能かつ未来のものだけ「あとN日」バッジを出す
  // （都道府県ごとに受付終了日がある制度は全国一律の締切で強調しない）
  const ctaActive = isCtaActive(s.status, s.deadline) && !hasRegionalDeadlines(s);
  const isUrgent = ctaActive && days != null && days <= 30;

  return (
    <Link
      href={`/subsidies/${s.id}`}
      aria-label={`${s.name} の詳細を見る`}
      style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--hc-white)",
        border: "1px solid var(--hc-border)",
        borderRadius: 16,
        padding: "20px 20px 16px",
        boxShadow: "var(--hc-shadow)",
        textDecoration: "none",
        cursor: "pointer",
        minHeight: 210,
        transition: "transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s, border-color 0.2s",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "var(--hc-shadow-md)";
        e.currentTarget.style.borderColor = "var(--hc-primary-border)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "var(--hc-shadow)";
        e.currentTarget.style.borderColor = "var(--hc-border)";
      }}
    >
      {/* 行A: カテゴリドット + 締切バッジ */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "var(--hc-primary)", flexShrink: 0,
          }} />
          <span style={{
            fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
            color: "var(--hc-text-muted)", textTransform: "uppercase",
          }}>
            {s.category || "補助金"}
          </span>
        </span>

        {/* 受付状態バッジ: 文言は API の status だけで決める（詳細ページの見出し・ステータス行と同じ語）。
            締切30日以内の公募中だけ強調色＋「あとN日」 */}
        <span
          data-testid="subsidy-card-status"
          style={isUrgent ? {
            fontSize: 11, fontWeight: 700,
            color: "var(--hc-accent)", background: "var(--hc-accent-subtle)",
            padding: "2px 8px", borderRadius: 9999,
          } : {
            fontSize: 11, fontWeight: 700,
            color: "var(--hc-text-muted)", background: "var(--hc-bg)",
            padding: "2px 8px", borderRadius: 9999,
            border: "1px solid var(--hc-border)",
          }}
        >
          {cardStatusText(s, prefecture)}
        </span>
      </div>

      {/* 見出し: 補助金名 Title20px・weight700（主役） */}
      <h3 style={{
        margin: "0 0 14px",
        flex: 1,
        fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: "-0.02em",
        lineHeight: 1.45,
        color: "var(--hc-navy)",
        display: "-webkit-box",
        WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      } as React.CSSProperties}>
        {s.name}
      </h3>

      {/* メタ罫 */}
      <div style={{ height: 1, background: "var(--hc-border)", margin: "0 0 14px" }} />

      {/* 行B: 上限額(目安) + 補助率 + 管轄 — ラベル/値グルーピングで階層明確化 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
        gap: "8px 12px",
        marginBottom: 14,
      }}>
        {/* 上限額(目安)・景表法: Caption級・大型化禁止 */}
        <div>
          <div style={{
            fontSize: 10,
            fontWeight: 600,
            color: "var(--hc-text-muted)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            marginBottom: 3,
          }}>上限額(目安)</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--hc-primary)", lineHeight: 1.2 }}>
            {formatAmountDisplay(s)}
          </div>
        </div>

        {/* 補助率 */}
        {s.rate_max != null && (
          <div>
            <div style={{
              fontSize: 10, fontWeight: 600,
              color: "var(--hc-text-muted)", letterSpacing: "0.04em",
              textTransform: "uppercase", marginBottom: 3,
            }}>補助率</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--hc-text)", lineHeight: 1.2 }}>
              {formatRate(s.rate_min, s.rate_max)}
            </div>
          </div>
        )}

        {/* 管轄 */}
        <div>
          <div style={{
            fontSize: 10, fontWeight: 600,
            color: "var(--hc-text-muted)", letterSpacing: "0.04em",
            textTransform: "uppercase", marginBottom: 3,
          }}>管轄</div>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--hc-text-muted)", lineHeight: 1.2 }}>
            {s.ministry}
          </div>
        </div>
      </div>

      {/* カメラ機器が補助対象と確認できない制度の注記（審査 F-[7]） */}
      <CameraEligibilityNote subsidy={s} compact />

      {/* 直接申請できない制度の注記（上限額が自治体単位であることを読めるように・審査[3]） */}
      <IndirectApplicantNote subsidy={s} />

      {/* 行C: カード右下・円形矢印ボタン（視覚的アフォーダンス） */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <span
          aria-label="詳しく見る"
          role="img"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--hc-primary-faint)",
            color: "var(--hc-primary)",
            fontSize: 15,
            fontWeight: 700,
            flexShrink: 0,
            transition: "background 0.15s, transform 0.15s",
          }}
        >
          →
        </span>
      </div>
    </Link>
  );
}
