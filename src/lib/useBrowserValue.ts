"use client";

import { useSyncExternalStore } from "react";

const subscribeNothing = () => () => {};

/**
 * ブラウザでだけ読める値（localStorage・JWT など）を、サーバー描画・hydration と食い違わずに読む（2026-11-01）。
 *
 * サーバーと hydration 中は serverValue、その後はブラウザで read() した値になる。
 * 旧実装の「effect の中で読んで setState」と同じ結果になるが、
 * effect 内の同期 setState（eslint の react-hooks/set-state-in-effect）を使わない。
 *
 * - read() は毎回の描画で呼ばれる。同じ内容なら同じ値を返すこと（オブジェクトは JSON 文字列にして返す）
 * - 読み込み後の変化（別タブでの保存など）は追わない（旧実装も初回に1回読むだけだった）
 */
export function useBrowserValue<T extends string | number | boolean | null>(
  read: () => T,
  serverValue: T,
): T {
  return useSyncExternalStore(subscribeNothing, read, () => serverValue);
}
