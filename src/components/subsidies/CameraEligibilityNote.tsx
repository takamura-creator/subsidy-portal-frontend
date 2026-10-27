/**
 * 「カメラ機器が補助対象かは公式資料で確認できていません」の注記（2026-10-27・審査 F-[7]）。
 * camera_eligibility が unconfirmed の制度でだけ出す。一覧・/match の結果・詳細・ウィザードで同じ言葉。
 * 副作用・状態を持たないので Server / Client どちらのコンポーネントからも使える。
 */

import { CAMERA_UNCONFIRMED_NOTE, isCameraUnconfirmed, type WithAttributes } from "@/lib/subsidyAttributes";

export default function CameraEligibilityNote({
  subsidy,
  compact = false,
  detail,
}: {
  subsidy: WithAttributes;
  /** true: カード内の1行（小さめ） */
  compact?: boolean;
  /** 注記の後ろに足す補足（例: 試算に使わない旨） */
  detail?: string;
}) {
  if (!isCameraUnconfirmed(subsidy)) return null;
  return (
    <p
      role="note"
      data-testid="camera-eligibility-note"
      style={{
        margin: compact ? "0 0 10px" : "0 0 16px",
        padding: compact ? "4px 8px" : "8px 12px",
        fontSize: compact ? 11 : 13,
        lineHeight: 1.6,
        color: "var(--hc-accent)",
        background: "var(--hc-accent-subtle)",
        borderRadius: 6,
      }}
    >
      ⚠ {CAMERA_UNCONFIRMED_NOTE}
      {detail ? `。${detail}` : ""}
    </p>
  );
}
