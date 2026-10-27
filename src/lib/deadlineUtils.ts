/**
 * 締切日付ユーティリティ。
 * SubsidyDetailClient.tsx から抽出した純関数。呼び出し側は import に切替済み。
 */

/**
 * H-3: CTA を有効化してよいかを判定する。
 * - status が "open" 以外（upcoming / closed）の場合は無効
 * - getDaysUntil が null（「〜頃」等パース不能な範囲表記）の場合は無効
 * - days <= 0（確実な期限切れ）の場合は無効
 * 二重ガードにより、期限切れ・公募前・締切未確定 を「申請可能」に見せない。
 */
export function isCtaActive(status: string, deadline: string): boolean {
  if (status !== "open") return false;
  const days = getDaysUntil(deadline);
  if (days === null) return false;
  if (days <= 0) return false;
  return true;
}

/**
 * H-3: CTA が非活性の理由を人が読める文字列で返す。
 * CTA ボタン代替テキストとして使用する。
 * 2026-10-27: 受付状態の言葉は API の status だけで決める（subsidyStatus.ts と同じ語:
 * closed=受付終了 / upcoming=公募予定）。open なのに締切日が読めない・過去日に見える場合も
 * 「締切済み」とは言い切らない（ステータス行の「公募中」と食い違うため）。
 */
export function getCtaDisabledReason(status: string, deadline: string): string {
  // 2026-10-27（審査 F-[12]）: 「次回公募をお待ちください」は次回があると言い切ってしまう
  // （例: 千葉県は令和8年度の実施自体を確認できていない）。受付状況の確認先を示すだけにする。
  if (status === "closed") return "受付終了（最新の受付状況は公式サイトでご確認ください）";
  if (status === "upcoming") return "公募予定（公募開始後にご確認ください）";
  if (status !== "open") return "受付状況は公式サイトでご確認ください";
  const days = getDaysUntil(deadline);
  if (days === null || days <= 0) return "締切日は公式サイトでご確認ください";
  return ""; // active なら空文字
}

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
