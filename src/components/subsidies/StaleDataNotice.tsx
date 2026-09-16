"use client";

/**
 * StaleDataNotice — 補助金データがバックエンドAPIから取得できず、
 * 同梱の静的スナップショット（ビルド時点のデータ）で表示中であることを示す注記。
 *
 * 2026-09-15 注文書「frontend が静的コピーを読み続ける（Railway 側だけ更新されて
 * 表示が古いまま）」を不合格の条件とし、「黙って古いデータを出さない」ことを
 * 明示要求されたため新設。一覧・詳細・カルーセル・ウィザードの4箇所で共通利用する
 * （デザイントークンは既存の --hc-warning系を再利用。ハードコード色は使わない）。
 *
 * 追加指摘#11 (2026-09-15): 「補助金一覧へ」の固定リンクが /subsidies ページ自身では
 * 自己参照（循環リンク）になっていた。現在のパスが /subsidies のときはリンクの代わりに
 * 「再読み込み」導線を出す。
 */

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StaleDataNotice({
  /** true: カルーセル等の小型UI向けに1行・小サイズで表示（リンクなし） */
  compact = false,
}: {
  compact?: boolean;
}) {
  const pathname = usePathname();
  const isOnListPage = pathname === "/subsidies";

  if (compact) {
    return (
      <p
        role="status"
        style={{
          display: "inline-block",
          margin: "0 0 8px",
          padding: "4px 10px",
          borderRadius: 6,
          border: "1px solid var(--hc-warning)",
          background: "var(--hc-warning-subtle)",
          color: "var(--hc-warning-text)",
          fontSize: 11,
          lineHeight: 1.5,
        }}
      >
        ⚠ 最新情報を取得できず、更新前のデータを表示中です
      </p>
    );
  }

  const linkStyle: React.CSSProperties = {
    color: "var(--hc-warning-text)",
    textDecoration: "underline",
    background: "none",
    border: "none",
    padding: 0,
    font: "inherit",
    cursor: "pointer",
  };

  return (
    <div
      role="status"
      style={{
        marginBottom: 16,
        padding: "10px 14px",
        borderRadius: 8,
        border: "1px solid var(--hc-warning)",
        background: "var(--hc-warning-subtle)",
        color: "var(--hc-warning-text)",
        fontSize: 13,
        lineHeight: 1.7,
      }}
    >
      {isOnListPage ? (
        <>
          ⚠ 最新情報を取得できなかったため、更新前のデータを表示しています。金額・締切等は{" "}
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={linkStyle}
          >
            再読み込み
          </button>
          して最新の内容をご確認ください。
        </>
      ) : (
        <>
          ⚠ 最新情報を取得できなかったため、更新前のデータを表示しています。金額・締切等は{" "}
          <Link href="/subsidies" style={linkStyle}>
            補助金一覧
          </Link>
          で最新の内容をご確認ください。
        </>
      )}
    </div>
  );
}
