/**
 * 補助金の受付状態の表示（2026-10-27 注文書: API の status を唯一の正とする）。
 *
 * 詳細ページの見出しバッジ・ステータス行・一覧カードのバッジは、すべてここを通して
 * API の status（open / upcoming / closed）から作る。締切文字列からの日付判定で
 * 「締切済み」と言い切らない（複数回公募・期間表記は日付判定できず、見出しとステータス行が
 * 食い違う原因になっていた）。日付は「あとN日」の補足にだけ使う。
 */

import { getDaysUntil } from "./deadlineUtils";

export type SubsidyStatus = "open" | "upcoming" | "closed";

const STATUS_LABEL: Record<SubsidyStatus, string> = {
  open: "公募中",
  upcoming: "公募予定",
  closed: "受付終了",
};

/** 想定外の status 値。「公募中」とは見せない（安全側）。 */
export const UNKNOWN_STATUS_LABEL = "受付状況は公式サイトでご確認ください";

export function isKnownStatus(status: string): status is SubsidyStatus {
  return status === "open" || status === "upcoming" || status === "closed";
}

/** status → 表示ラベル（closed=受付終了 / upcoming=公募予定 / open=公募中）。 */
export function subsidyStatusLabel(status: string): string {
  return isKnownStatus(status) ? STATUS_LABEL[status] : UNKNOWN_STATUS_LABEL;
}

/**
 * バッジ文言。ラベルは status だけで決まり、open のときだけ締切日が読めれば「あとN日」を添える。
 * @param showDaysWithin この日数以内のときだけ「あとN日」を添える（省略時は未来日なら常に添える）
 */
export function subsidyStatusBadgeText(
  status: string,
  deadline: string,
  showDaysWithin?: number,
): string {
  const label = subsidyStatusLabel(status);
  if (status !== "open") return label;
  const days = getDaysUntil(deadline);
  if (days === null || days <= 0) return label;
  if (showDaysWithin !== undefined && days > showDaysWithin) return label;
  return `${label}・締切まであと${days}日`;
}
