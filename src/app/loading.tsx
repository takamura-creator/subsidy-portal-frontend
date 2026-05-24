/**
 * ルート Suspense フォールバック。
 *
 * 以前は animate-pulse の横長スケルトンを返していたが、
 * navigation transition 時にホームヒーロー（亀キャラ）の直前で
 * 白い横長矩形がフラッシュして「亀の真後ろに一瞬出る」と
 * ユーザー報告。スケルトン位置がヒーロー位置と重なるため
 * 違和感が大きく、null 返却で透過にする。
 *
 * 個別の遅延ページ（/subsidies 等）は独自の loading.tsx を持つため
 * このルートを null にしてもそれぞれの skeleton は維持される。
 */
export default function Loading() {
  return null;
}
