/**
 * 締切日付ユーティリティ。
 * SubsidyDetailClient.tsx から抽出した純関数。呼び出し側は import に切替済み。
 */

/** deadlineテキストから次の日付を抽出し、残日数を返す。パース不能ならnullを返す。
 *  タイムゾーンずれによる±1日誤差を防ぐため、target・now ともに正午(12:00:00)で正規化する。
 */
export function getDaysUntil(dateStr: string): number | null {
  // "2026年5月12日" or "2026/5/12" 形式を探す
  const patterns = [
    /(\d{4})年(\d{1,2})月(\d{1,2})日/g,
    /(\d{4})\/(\d{1,2})\/(\d{1,2})/g,
  ];
  const now = new Date();
  now.setHours(12, 0, 0, 0); // 正午正規化（日付比較のタイムゾーンずれ排除）
  let nearest: number | null = null;
  for (const re of patterns) {
    let m;
    while ((m = re.exec(dateStr)) !== null) {
      const target = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0);
      const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      // 未来の日付のうち最も近いものを採用。すべて過去なら最も近い過去を採用
      if (diff > 0 && (nearest === null || diff < nearest)) {
        nearest = diff;
      } else if (nearest === null || (nearest < 0 && diff > nearest)) {
        nearest = diff;
      }
    }
  }
  return nearest;
}
