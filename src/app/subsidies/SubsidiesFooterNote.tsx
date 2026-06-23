"use client";

/**
 * 補助金一覧ページ末尾フットノート。
 * 旧 SubsidiesRightPanel の注記群を集約。景表法 .mc-disclaimer 必須維持。
 */

import Link from "next/link";

export default function SubsidiesFooterNote() {
  return (
    <div
      style={{
        borderTop: "1px solid var(--hc-border)",
        paddingTop: 16,
        fontSize: 12,
        color: "var(--hc-text-muted)",
        lineHeight: 1.7,
      }}
    >
      {/* 景表法注記（.mc-disclaimer 維持） */}
      <p className="mc-disclaimer" style={{ marginBottom: 6 }}>
        ※掲載金額は上限額の目安です。制度・条件により異なります。
      </p>
      {/* 掲載情報注記 */}
      <p style={{ margin: "0 0 6px" }}>
        掲載情報は各省庁・自治体の公式データに基づきます。最終更新日を必ずご確認ください。
      </p>
      {/* 施工パートナーリンク（フッターテキストリンクに降格） */}
      <p style={{ margin: 0 }}>
        設置・施工は{" "}
        <Link
          href="/partners/multik"
          style={{ color: "var(--hc-primary)", textDecoration: "underline" }}
        >
          施工パートナー
        </Link>
        をご覧ください。
      </p>
    </div>
  );
}
