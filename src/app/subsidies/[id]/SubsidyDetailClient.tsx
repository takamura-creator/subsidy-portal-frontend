"use client";

/**
 * 補助金詳細ページ — 単一カラム（Apple スタイル）。
 * Sprint 2 Wave 単一カラム化: ThreeColumnLayout 廃止。
 * - AnchorNav（sticky top 横並びTOC）
 * - 本文 max-width 760px centered
 * - StickyCtaBar（sticky bottom）
 * - 本文末インラインCTA
 * - 景表法注記 mc-disclaimer 維持
 */

import Link from "next/link";
import AnchorNav from "@/components/subsidies/AnchorNav";
import SubsidyJichikaiBlocks from "@/components/subsidies/SubsidyJichikaiBlocks";
import SubsidyInfoSections from "@/components/subsidies/SubsidyInfoSections";
import StickyCtaBar from "@/components/subsidies/StickyCtaBar";
import type { Subsidy } from "@/lib/api";
import { getDaysUntil, isCtaActive, getCtaDisabledReason } from "@/lib/deadlineUtils";
import { formatAmount } from "@/lib/subsidyFormatters";

export default function SubsidyDetailClient({ subsidy: s }: { subsidy: Subsidy }) {
  const days = getDaysUntil(s.deadline);
  // H-3: status と deadline の両方でガード
  const ctaActive = isCtaActive(s.status, s.deadline);
  const disabledReason = ctaActive ? "" : getCtaDisabledReason(s.status, s.deadline);
  const isJichikai = s.target_industries?.includes("自治会・町会") ?? false;

  return (
    <>
      {/* sticky 横並び TOC ナビ */}
      <AnchorNav />

      {/* 本文エリア（max-width 760px centered） */}
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "40px 20px 120px",
        }}
      >
        {/* パンくずリスト */}
        <div style={{ fontSize: 12, color: "var(--hc-text-muted)", marginBottom: 20 }}>
          <Link href="/subsidies" style={{ color: "var(--hc-primary)", textDecoration: "none" }}>
            補助金一覧
          </Link>
          {" › "}
          {s.name}
        </div>

        {/* h1 — clamp(32px, 4vw, 48px) */}
        <h1
          style={{
            fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
            fontSize: "clamp(32px, 4vw, 48px)",
            fontWeight: 700,
            color: "var(--hc-navy)",
            letterSpacing: "-0.03em",
            lineHeight: 1.2,
            marginBottom: 16,
            marginTop: 0,
          }}
        >
          {s.name}
        </h1>

        {/* メタタグ行 */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
          {/* 締切バッジ */}
          <span
            style={{
              fontSize: 12,
              padding: "4px 10px",
              borderRadius: 9999,
              fontWeight: 600,
              background: "var(--hc-accent-subtle)",
              color: "var(--hc-accent)",
            }}
          >
            {/* H-3: status/deadline 両方チェックしたバッジ表示 */}
              {!ctaActive
                ? (disabledReason || `締切: ${s.deadline}`)
                : days !== null && days > 0
                  ? `締切まであと${days}日`
                  : `締切: ${s.deadline}`}
          </span>

          {/* 上限額バッジ（景表法: Caption級・無彩色） */}
          <span
            style={{
              fontSize: 12,
              padding: "4px 10px",
              borderRadius: 9999,
              fontWeight: 500,
              background: "var(--hc-bg)",
              color: "var(--hc-text-muted)",
            }}
          >
            上限額（目安）{formatAmount(s.max_amount)}
          </span>

          {/* 出典バッジ */}
          <span
            style={{
              fontSize: 12,
              padding: "4px 10px",
              borderRadius: 9999,
              fontWeight: 500,
              background: "var(--hc-bg)",
              color: "var(--hc-text-muted)",
            }}
          >
            出典: {s.ministry}{s.updated_at ? ` ・ ${s.updated_at} 更新` : ""}
          </span>
        </div>

        {/* 景表法注記 */}
        <p className="mc-disclaimer" style={{ marginBottom: 32 }}>
          ※制度・条件により異なります。出典：公式資料。診断は目安です。
        </p>

        {/* 自治会ブロック（条件付き） */}
        {isJichikai && (
          <div style={{ marginBottom: 96 }}>
            <SubsidyJichikaiBlocks subsidyId={s.id} subsidyName={s.name} />
          </div>
        )}

        {/* 各情報セクション */}
        <SubsidyInfoSections subsidy={s} />

        {/* 本文末インライン CTA — H-3: status/deadline 両方でガード */}
        <div style={{ marginTop: 56, textAlign: "center" }}>
          {!ctaActive ? (
            <span
              role="button"
              aria-disabled="true"
              aria-label={disabledReason || "現在は申請を受け付けていません"}
              style={{
                display: "inline-block",
                padding: "16px 32px",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                color: "var(--hc-text-muted)",
                background: "var(--hc-bg)",
                border: "1px solid var(--hc-border)",
                cursor: "not-allowed",
                fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
              }}
            >
              {disabledReason || "現在は申請を受け付けていません"}
            </span>
          ) : (
            <Link
              href={`/my/wizard?subsidy_id=${s.id}`}
              style={{
                display: "inline-block",
                padding: "16px 32px",
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 700,
                color: "var(--hc-white)",
                background: "var(--hc-primary)",
                textDecoration: "none",
                fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
                letterSpacing: "-0.2px",
              }}
            >
              この補助金で申請書を作成する
            </Link>
          )}
          <p style={{ fontSize: 12, color: "var(--hc-text-muted)", marginTop: 10 }}>
            <Link href="/partners/multik" style={{ color: "var(--hc-primary)", textDecoration: "none" }}>
              施工パートナーを探す →
            </Link>
          </p>
        </div>

        {/* 補助金サマリー（本文末 info 定義リスト） */}
        <dl
          style={{
            marginTop: 48,
            borderTop: "1px solid var(--hc-border)",
            paddingTop: 24,
            display: "grid",
            gridTemplateColumns: "120px 1fr",
            rowGap: 12,
            columnGap: 16,
            fontSize: 13,
          }}
        >
          {[
            ["管轄", s.ministry],
            ["カテゴリ", s.category],
            ["地域", s.prefecture],
          ].map(([label, value]) => (
            value ? (
              <>
                <dt
                  key={`dt-${label}`}
                  style={{ color: "var(--hc-text-muted)", fontWeight: 500 }}
                >
                  {label}
                </dt>
                <dd
                  key={`dd-${label}`}
                  style={{ color: "var(--hc-text)", fontWeight: 600, margin: 0 }}
                >
                  {value}
                </dd>
              </>
            ) : null
          ))}
        </dl>
      </div>

      {/* sticky 下部 CTA バー */}
      <StickyCtaBar subsidy={s} />
    </>
  );
}
