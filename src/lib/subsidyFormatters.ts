/**
 * 補助金表示フォーマッター
 * SubsidyDetailClient から抽出した純粋関数群。
 */

export function formatAmount(amount: number): string {
  if (amount >= 10000000) return `${Math.round(amount / 10000000) * 1000}万円`;
  if (amount >= 10000) return `${Math.round(amount / 10000)}万円`;
  return `${amount.toLocaleString("ja-JP")}円`;
}

export function formatFraction(rate: number): string {
  if (rate === 0.5) return "1/2";
  if (rate === 0.67 || Math.abs(rate - 2 / 3) < 0.01) return "2/3";
  if (rate === 0.75) return "3/4";
  if (rate === 1) return "全額";
  if (rate === 0.25) return "1/4";
  if (rate === 0.33 || Math.abs(rate - 1 / 3) < 0.01) return "1/3";
  return `${Math.round(rate * 100)}%`;
}

export function formatRate(rateMin: number | null, rateMax: number | null): string {
  if (rateMin == null && rateMax == null) return "—";
  const mn = rateMin ?? rateMax!;
  const mx = rateMax ?? rateMin!;
  const minPct = Math.round(mn * 100);
  const maxPct = Math.round(mx * 100);
  if (minPct === maxPct) return `${minPct}%（${formatFraction(mn)}）`;
  return `${formatFraction(mn)}〜${formatFraction(mx)}`;
}
