"use client";

import Link from "next/link";

/**
 * AI 機能が使えないときの表示（2026-11-01 設計書 docs/design/resilience.md §2-2・PR-A）。
 *
 * - 見出し・本文は lib/errorCopy.ts の aiErrorCopy() で決める（ステータス番号は出さない）
 * - 再試行は押したときだけ AI を呼ぶ（自動では再試行しない：30秒待ち×課金が倍になるため）
 * - AI を使わない導線を必ず出す。補助金一覧は backend が落ちていても同梱データで表示される
 */
export default function AiUnavailableNotice({
  title,
  body,
  onRetry,
  retryLabel = "同じ条件でもう一度試す",
  industry,
}: {
  title: string;
  body: string;
  onRetry?: () => void;
  retryLabel?: string;
  /** 補助金一覧へのリンクに付ける業種（表示名のまま。/match の「一覧で見る」と同じ形） */
  industry?: string;
}) {
  const listHref = industry ? `/subsidies?industry=${encodeURIComponent(industry)}` : "/subsidies";

  return (
    <div
      role="alert"
      data-testid="ai-unavailable"
      style={{
        padding: "32px 24px",
        textAlign: "center",
        background: "var(--hc-card-bg)",
        border: "1px solid var(--hc-border)",
        borderRadius: 10,
      }}
    >
      <p style={{ fontSize: 15, fontWeight: 700, color: "var(--hc-navy)", margin: "0 0 8px" }}>{title}</p>
      <p style={{ fontSize: 13, color: "var(--hc-text-muted)", margin: "0 0 6px", lineHeight: 1.6 }}>{body}</p>
      <p style={{ fontSize: 13, color: "var(--hc-text-muted)", margin: "0 0 20px", lineHeight: 1.6 }}>
        AIを使わなくても、補助金の検索と相談はご利用いただけます。
      </p>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="btn-primary"
            style={{ padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            {retryLabel}
          </button>
        )}
        <Link
          href={listHref}
          style={{ fontSize: 13, fontWeight: 600, color: "var(--hc-primary)", textDecoration: "underline" }}
        >
          条件に近い補助金を一覧で見る
        </Link>
        <Link
          href="/contact"
          style={{ fontSize: 13, fontWeight: 600, color: "var(--hc-primary)", textDecoration: "underline" }}
        >
          専門スタッフに相談する
        </Link>
      </div>
    </div>
  );
}
