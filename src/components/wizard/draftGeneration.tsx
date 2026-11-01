"use client";

import { useEffect } from "react";

/**
 * 事業計画書の AI 生成中に再読み込みされたときの扱い（2026-11-01 設計書 docs/design/resilience.md PR-E・D4）。
 *
 * 旧: ウィザードは step を localStorage に保存しているため、生成中（30秒〜1分）に再読み込みすると
 * 生成の画面が開き直され、黙って最初から生成し直していた（待ち時間も AI の課金も2回）。
 * 新: 生成を始めた時刻をウィザードの状態に残し、その時刻から一定時間内に開き直されたら自動では生成せず、
 * 利用者に「もう一度生成するか」を選んでもらう。一定時間を過ぎた印は無視して従来どおり自動で生成する。
 */

/** 生成開始からこの時間内に開き直されたら「途中で止まった」とみなす（生成の上限120秒＋余裕） */
export const DRAFT_INTERRUPT_WINDOW_MS = 3 * 60 * 1000;

export function isInterruptedGeneration(startedAt: number | undefined, now: number): boolean {
  if (typeof startedAt !== "number") return false;
  const elapsed = now - startedAt;
  return elapsed >= 0 && elapsed < DRAFT_INTERRUPT_WINDOW_MS;
}

/** 生成中はページを離れる前にブラウザ標準の確認を出す（文言はブラウザが決める） */
export function useLeaveWarning(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // 古いブラウザ向け（returnValue に値を入れないと確認が出ないもの）
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [active]);
}

/** 「前回の生成が途中で止まりました」と、もう一度生成するボタン */
export function DraftInterruptedNotice({ onGenerate }: { onGenerate: () => void }) {
  return (
    <div
      role="status"
      data-testid="draft-interrupted"
      className="max-w-md mx-auto rounded-lg border border-amber-200 bg-amber-50 p-5 text-center"
    >
      <p className="text-sm font-bold text-amber-900">前回の生成が途中で止まりました</p>
      <p className="mt-2 text-[13px] text-amber-800 leading-relaxed">
        もう一度生成しますか？最初から作り直します（30秒〜1分ほどかかります）。
      </p>
      <button
        type="button"
        onClick={onGenerate}
        className="mt-4 px-6 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90"
      >
        生成する
      </button>
    </div>
  );
}
