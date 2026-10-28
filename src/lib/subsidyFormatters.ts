/**
 * 補助金表示フォーマッター
 * SubsidyDetailClient から抽出した純粋関数群。
 *
 * 2026-10-27（正本36件化）:
 * - 上限額 0 = 国一律の上限が無い制度（例: 地域医療介護総合確保基金）。「0円」とは出さない。
 * - 万円未満の端数を丸めない（立川市 15,000円を「2万円」、八王子市 421,000円を「42万円」と出していた→1.5万円・42.1万円）。
 * - 1,000万円以上を千万単位に丸めない（1,250万円を「1000万円」と出していた）。
 * - 補助率 0 は「0%」と出さない。7/12・23/24・9/10 などの分数を正しく出す。
 */

import { isPerCameraCap, subsidyAttributes, type WithAttributes } from "@/lib/subsidyAttributes";

/** 国一律の上限・補助率が無い制度の表記 */
export const VARIES_BY_LOCAL_GOV = "都道府県・自治体ごとに異なる";

/** 上限額が設定されているか（0・未設定は「国一律の上限なし」） */
export function hasAmountCap(amount: number | null | undefined): amount is number {
  return typeof amount === "number" && Number.isFinite(amount) && amount > 0;
}

/**
 * 上限額が「カメラ1台あたり」か。正本の max_amount_unit で決める（2026-10-27）。
 * 以前は draft_subsidy_type（書類様式の種別）＋総額の制度の固定 id 一覧で判定していた。
 */
export function isPerUnitCap(s: WithAttributes): boolean {
  return isPerCameraCap(s);
}

export function formatAmount(amount: number | null | undefined): string {
  if (!hasAmountCap(amount)) return VARIES_BY_LOCAL_GOV;
  // 千円単位まで割り切れる額は万円で出す（例: 421,000円→42.1万円・15,000円→1.5万円）。それ以外は円で正確に出す
  if (amount >= 10000 && amount % 1000 === 0) {
    return `${(amount / 10000).toLocaleString("ja-JP", { maximumFractionDigits: 1 })}万円`;
  }
  return `${amount.toLocaleString("ja-JP")}円`;
}

/** 制度の上限額（1台あたりの制度は「/台」、台数上限があれば「・N台まで」を付ける） */
export function formatSubsidyAmount(s: WithAttributes & {
  max_amount: number | null | undefined;
}): string {
  if (!hasAmountCap(s.max_amount)) return VARIES_BY_LOCAL_GOV;
  if (!isPerUnitCap(s)) return formatAmount(s.max_amount);
  const units = subsidyAttributes(s).max_units;
  return `${formatAmount(s.max_amount)}/台${units ? `・${units}台まで` : ""}`;
}

const FRACTION_TOLERANCE = 0.0005;

export function formatFraction(rate: number): string {
  if (Math.abs(rate - 1) < FRACTION_TOLERANCE) return "全額";
  // 分母24までで一致する分数（1/2, 2/3, 3/4, 7/12, 9/10, 23/24 など）
  for (let d = 2; d <= 24; d++) {
    const n = Math.round(rate * d);
    if (n > 0 && n < d && Math.abs(rate - n / d) < FRACTION_TOLERANCE) return `${n}/${d}`;
  }
  return `${Math.round(rate * 100)}%`;
}

function hasRate(rate: number | null | undefined): rate is number {
  return typeof rate === "number" && Number.isFinite(rate) && rate > 0;
}

export function formatRate(rateMin: number | null, rateMax: number | null): string {
  if (rateMin == null && rateMax == null) return "—";
  if (!hasRate(rateMin) && !hasRate(rateMax)) return VARIES_BY_LOCAL_GOV;
  const mn = hasRate(rateMin) ? rateMin : (rateMax as number);
  const mx = hasRate(rateMax) ? rateMax : mn;
  const minPct = Math.round(mn * 100);
  const maxPct = Math.round(mx * 100);
  if (Math.abs(mn - mx) < FRACTION_TOLERANCE) {
    // 2026-10-28（審査[9]）: 補助率 1.0（例: 川口市）は「100%（全額）」と言い切らない。上限額を超える分は自己負担になる
    if (Math.abs(mn - 1) < FRACTION_TOLERANCE) return FULL_UP_TO_CAP;
    const frac = formatFraction(mn);
    return frac.endsWith("%") ? `${minPct}%` : `${minPct}%（${frac}）`;
  }
  if (minPct === maxPct) return `${minPct}%`;
  const hiText = Math.abs(mx - 1) < FRACTION_TOLERANCE ? "全額（上限額まで）" : formatFraction(mx);
  return `${formatFraction(mn)}〜${hiText}`;
}

/** 補助率 1.0 の表記（上限額までは全額・上限を超える分は自己負担） */
export const FULL_UP_TO_CAP = "上限額までは全額（上限を超える分は自己負担）";

/**
 * 自己負担の割合（補助率が無い・0 の制度は「—」）。
 * 補助率 1.0 でも上限額を超える分は自己負担になるため「0%」とは出さない（審査[9]）。
 */
export function formatSelfPay(rateMin: number | null | undefined, rateMax: number | null | undefined): string {
  const mx = rateMax != null && rateMax > 0 ? rateMax : null;
  const mn = rateMin != null && rateMin > 0 ? rateMin : null;
  if (mx == null) return "—";
  const lo = mn ?? mx;
  if (Math.abs(mx - 1) < FRACTION_TOLERANCE) {
    return Math.abs(lo - 1) < FRACTION_TOLERANCE
      ? "上限額を超える分（上限額までは補助）"
      : `最大${Math.round((1 - lo) * 100)}%（上限額を超える分は自己負担）`;
  }
  const hi = `${Math.round((1 - mx) * 100)}%`;
  return Math.abs(lo - mx) > FRACTION_TOLERANCE ? `${hi}〜${Math.round((1 - lo) * 100)}%` : hi;
}
