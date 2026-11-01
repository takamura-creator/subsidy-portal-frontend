/**
 * サイト内のページへ「全画面の読み込み」で移る（2026-11-01）。
 *
 * ログイン切れ・ログアウト・アカウント削除・権限の無いページからの退避に使う。
 * ブラウザに読み込み済みの状態（React の state・モジュール内のキャッシュ）を前のユーザーの分ごと捨てたいので、
 * あえて `useRouter().push()` を使わない。React の外（lib/auth.ts・lib/api.ts）からも呼べる。
 *
 * それ以外の画面内の移動は `next/link` か `useRouter()` を使う
 * （eslint の `@next/next/no-location-assign-relative-destination` がそれを求めている）。
 * 挙動は `window.location.href = path` と同じ（履歴に1件積む）。
 */
export function hardNavigate(path: string): void {
  window.location.href = path;
}
