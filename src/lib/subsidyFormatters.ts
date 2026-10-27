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

/** 国一律の上限・補助率が無い制度の表記 */
export const VARIES_BY_LOCAL_GOV = "都道府県・自治体ごとに異なる";

/**
 * 上限額の数値が「1申請あたりの総額」で、カメラ1台あたりではない自治体防犯の制度。
 * 正本の draft_subsidy_type は書類様式の種別で、これだけでは1台あたりかどうかが分からないため、
 * 説明文で総額と確認できたものをここで除く（東京都=都補助限度額525万円・埼玉県=1市町村あたり400万円）。
 */
const TOTAL_CAP_JICHITAI_IDS: ReadonlySet<string> = new Set([
  "tokyo-bouhan-2026",
  "saitama-bouhan-2026",
]);

/** 上限額が設定されているか（0・未設定は「国一律の上限なし」） */
export function hasAmountCap(amount: number | null | undefined): amount is number {
  return typeof amount === "number" && Number.isFinite(amount) && amount > 0;
}

/** 上限額が「カメラ1台あたり」か */
export function isPerUnitCap(s: { id: string; draft_subsidy_type?: string | null }): boolean {
  return s.draft_subsidy_type === "jichitai_bouhan" && !TOTAL_CAP_JICHITAI_IDS.has(s.id);
}

export function formatAmount(amount: number | null | undefined): string {
  if (!hasAmountCap(amount)) return VARIES_BY_LOCAL_GOV;
  // 千円単位まで割り切れる額は万円で出す（例: 421,000円→42.1万円・15,000円→1.5万円）。それ以外は円で正確に出す
  if (amount >= 10000 && amount % 1000 === 0) {
    return `${(amount / 10000).toLocaleString("ja-JP", { maximumFractionDigits: 1 })}万円`;
  }
  return `${amount.toLocaleString("ja-JP")}円`;
}

/** 制度の上限額（1台あたりの制度は「/台」を付ける） */
export function formatSubsidyAmount(s: {
  id: string;
  max_amount: number | null | undefined;
  draft_subsidy_type?: string | null;
}): string {
  if (!hasAmountCap(s.max_amount)) return VARIES_BY_LOCAL_GOV;
  return isPerUnitCap(s) ? `${formatAmount(s.max_amount)}/台` : formatAmount(s.max_amount);
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
    const frac = formatFraction(mn);
    return frac.endsWith("%") ? `${minPct}%` : `${minPct}%（${frac}）`;
  }
  if (minPct === maxPct) return `${minPct}%`;
  return `${formatFraction(mn)}〜${formatFraction(mx)}`;
}
