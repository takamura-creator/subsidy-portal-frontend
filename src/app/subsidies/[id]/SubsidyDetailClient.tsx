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
import StaleDataNotice from "@/components/subsidies/StaleDataNotice";
import type { Subsidy } from "@/lib/api";
import { isCtaActive, getCtaDisabledReason } from "@/lib/deadlineUtils";
import { formatSubsidyAmount } from "@/lib/subsidyFormatters";
import { subsidyStatusBadgeText } from "@/lib/subsidyStatus";
import {
  HOME_GUIDE,
  INDIRECT_GUIDE,
  hasRegionalDeadlines,
  isHomeSubsidy,
  isIndirect,
} from "@/lib/subsidyAttributes";
import { hasTemplatesPage } from "@/lib/jichikai";
import CameraEligibilityNote from "@/components/subsidies/CameraEligibilityNote";

export default function SubsidyDetailClient({
  subsidy: s,
  stale = false,
}: {
  subsidy: Subsidy;
  /** true: API取得に失敗し同梱データ（古い可能性）で表示中（2026-09-15 注文書） */
  stale?: boolean;
}) {
  // H-3: status と deadline の両方でガード
  // 利用者が直接申請できない制度（市町村・都道府県を通じて使う）は申請ボタンを出さず窓口を案内する（審査 F-[6]）
  const indirect = isIndirect(s);
  // 個人宅向けの制度は住民が区市町村へ申請する。ウィザード（事業者・自治会向け）へ送ると行き止まりになるため
  // 申請書作成の導線を出さず、区市町村の窓口・公式ページを案内する（2026-10-28 審査[8]）
  const home = !indirect && isHomeSubsidy(s);
  const ctaActive = !indirect && !home && isCtaActive(s.status, s.deadline);
  const disabledReason = ctaActive || indirect || home ? "" : getCtaDisabledReason(s.status, s.deadline);
  const isJichikai = s.target_industries?.includes("自治会・町会") ?? false;
  // 都道府県ごとに受付終了日がある制度（業務改善助成金）は「公募中」と言い切らない（2026-10-28 審査[2]）
  const regional = hasRegionalDeadlines(s);
  const statusBadge =
    regional && s.status === "open"
      ? "公募中（都道府県ごとに受付終了あり）"
      : subsidyStatusBadgeText(s.status, s.deadline);

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

        {/* API不達フォールバック中の注記（黙って古いデータを出さない） */}
        {stale && <StaleDataNotice />}

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
          {/* 受付状態バッジ: API の status だけで決める（ステータス行・一覧バッジと同じ語） */}
          <span
            data-testid="subsidy-status-badge"
            style={{
              fontSize: 12,
              padding: "4px 10px",
              borderRadius: 9999,
              fontWeight: 600,
              background: "var(--hc-accent-subtle)",
              color: "var(--hc-accent)",
            }}
          >
            {statusBadge}
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
            上限額（目安）{formatSubsidyAmount(s)}
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

        {/* カメラ機器が補助対象と確認できない制度の注記（審査 F-[7]） */}
        <CameraEligibilityNote subsidy={s} />

        {/* 景表法注記 */}
        <p className="mc-disclaimer" style={{ marginBottom: 32 }}>
          ※制度・条件により異なります。出典：公式資料。診断は目安です。
        </p>

        {/* 自治会ブロック（条件付き） */}
        {isJichikai && (
          <div style={{ marginBottom: 96 }}>
            <SubsidyJichikaiBlocks subsidyId={s.id} subsidyName={s.name} showTemplates={hasTemplatesPage(s)} />
          </div>
        )}

        {/* 各情報セクション */}
        <SubsidyInfoSections subsidy={s} />

        {/* 本文末インライン CTA — H-3: status/deadline 両方でガード */}
        <div style={{ marginTop: 56, textAlign: "center" }}>
          {indirect ? (
            <div data-testid="indirect-cta" style={{ fontSize: 15, color: "var(--hc-text)", lineHeight: 1.7 }}>
              <p style={{ margin: "0 0 8px", fontWeight: 600 }}>
                この制度は直接は申請できません。申請は{INDIRECT_GUIDE}ご相談ください。
              </p>
              {s.source_url && (
                <a
                  href={s.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--hc-primary)", textDecoration: "underline", fontSize: 14 }}
                >
                  公式サイトで制度の内容を確認する →
                </a>
              )}
            </div>
          ) : home ? (
            <div data-testid="home-cta" style={{ fontSize: 15, color: "var(--hc-text)", lineHeight: 1.7 }}>
              <p style={{ margin: "0 0 8px", fontWeight: 600 }}>
                個人宅向けの制度です。{HOME_GUIDE}してください。
              </p>
              {s.source_url && (
                <a
                  href={s.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--hc-primary)", textDecoration: "underline", fontSize: 14 }}
                >
                  区市町村の公式ページで申請方法を確認する →
                </a>
              )}
            </div>
          ) : !ctaActive ? (
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
          {regional && !indirect && (
            <p data-testid="regional-cta-note" style={{ fontSize: 13, color: "var(--hc-accent)", marginTop: 10, lineHeight: 1.6 }}>
              都道府県ごとに受付終了日が違います。事業所のある都道府県の受付終了日を、上の「都道府県ごとの受付終了日」でご確認ください。
            </p>
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
