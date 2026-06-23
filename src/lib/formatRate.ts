/**
 * formatRate — 補助率表示ユーティリティ
 * HeroLivePreview.tsx / MatchResultCard.tsx 共用（重複実装禁止）
 * rate_min / rate_max が null の場合に空文字を返す（景表法ガード）
 */
export function formatRate(
  min: number | null | undefined,
  max: number | null | undefined,
): string {
  const mn = min ?? null;
  const mx = max ?? null;
  if (mn == null && mx == null) return "";
  if (mn == null) return `最大 ${mx}%`;
  if (mx == null) return `${mn}%〜`;
  if (mn === mx) return `${mn}%`;
  return `${mn}〜${mx}%`;
}
