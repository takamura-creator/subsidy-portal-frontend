"use client";

/**
 * 補助金詳細ページ sticky 下部 CTA バー（Apple 購入バー風）。
 * 高さ 64px / sticky bottom 0 / 左=補助金名+締切meta / 右=プライマリボタン。
 * C9対応: 締切済み時は CTA を disabled/グレーアウトして誤操作予防。
 */

import Link from "next/link";
import type { Subsidy } from "@/lib/api";
import { getDaysUntil, isCtaActive, getCtaDisabledReason } from "@/lib/deadlineUtils";
import { HOME_GUIDE, INDIRECT_GUIDE, hasRegionalDeadlines, isHomeSubsidy, isIndirect } from "@/lib/subsidyAttributes";

interface StickyCtaBarProps {
  subsidy: Subsidy;
}

export default function StickyCtaBar({ subsidy: s }: StickyCtaBarProps) {
  const days = getDaysUntil(s.deadline);
  // H-3: status と deadline の両方でガード（二重チェック）
  // 直接申請できない制度は申請ボタンを出さず、窓口を案内する（審査 F-[6]）
  const indirect = isIndirect(s);
  // 個人宅向けの制度は区市町村の窓口・公式ページへ（ウィザードへ送ると行き止まり・2026-10-28 審査[8]）
  const home = !indirect && isHomeSubsidy(s);
  const ctaActive = !indirect && !home && isCtaActive(s.status, s.deadline);
  const disabledReason = indirect
    ? `申請は${INDIRECT_GUIDE}`
    : home
      ? HOME_GUIDE
      : ctaActive ? "" : getCtaDisabledReason(s.status, s.deadline);

  const deadlineMeta = !ctaActive && disabledReason
    ? disabledReason
    : hasRegionalDeadlines(s)
      // 都道府県ごとに受付終了日が違う制度は、全国一律の締切から「あとN日」を出さない（審査[2]）
      ? "都道府県ごとに受付終了日が異なります"
      : days !== null && days > 0
        ? `締切まであと${days}日`
        : `締切: ${s.deadline}`;

  return (
    <div
      style={{
        position: "sticky",
        bottom: 0,
        zIndex: 30,
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "0 20px",
        background: "var(--hc-white)",
        borderTop: "1px solid var(--hc-border)",
        boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
      }}
    >
      {/* 左: 補助金名 + 締切meta */}
      <div style={{ overflow: "hidden", minWidth: 0 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--hc-navy)",
            margin: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
          }}
        >
          {s.name}
        </p>
        <p
          style={{
            fontSize: 11,
            color: !ctaActive ? "var(--hc-accent)" : "var(--hc-text-muted)",
            margin: "2px 0 0",
          }}
        >
          {deadlineMeta}
        </p>
      </div>

      {/* 右: プライマリボタン or 締切済み/未確定/公募前 無効状態 */}
      {indirect ? (
        <span
          data-testid="indirect-cta"
          style={{
            flexShrink: 0,
            fontSize: 12,
            fontWeight: 600,
            color: "var(--hc-text-muted)",
            whiteSpace: "nowrap",
          }}
        >
          直接は申請できません
        </span>
      ) : home ? (
        s.source_url ? (
          <a
            data-testid="home-cta"
            href={s.source_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              padding: "10px 20px",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              color: "var(--hc-primary)",
              background: "var(--hc-white)",
              border: "1px solid var(--hc-primary)",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            公式ページで申請方法を見る
          </a>
        ) : (
          <span data-testid="home-cta" style={{ flexShrink: 0, fontSize: 12, fontWeight: 600, color: "var(--hc-text-muted)", whiteSpace: "nowrap" }}>
            区市町村の窓口へ
          </span>
        )
      ) : !ctaActive ? (
        <span
          role="button"
          aria-disabled="true"
          aria-label={disabledReason || "現在は申請を受け付けていません"}
          style={{
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            padding: "10px 20px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            color: "var(--hc-text-muted)",
            background: "var(--hc-bg)",
            border: "1px solid var(--hc-border)",
            whiteSpace: "nowrap",
            fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
            letterSpacing: "-0.2px",
            cursor: "not-allowed",
            userSelect: "none",
          }}
        >
          {disabledReason || "現在は受付停止中"}
        </span>
      ) : (
        <Link
          href={`/my/wizard?subsidy_id=${s.id}`}
          style={{
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            padding: "10px 20px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            color: "var(--hc-white)",
            background: "var(--hc-primary)",
            textDecoration: "none",
            whiteSpace: "nowrap",
            fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
            letterSpacing: "-0.2px",
          }}
        >
          申請書を作成する
        </Link>
      )}
    </div>
  );
}
