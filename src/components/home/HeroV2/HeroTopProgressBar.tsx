"use client";

/**
 * HeroTopProgressBar — 画面上端 fixed 3px 進行バー
 *
 * 台本 §5.2 top_bar / A7 / B / S5 / E1・E3・E8 / A'2。
 * - 応答前は 88% を超えない（禁止事項4）。100% 到達は成功時のみ（S5）
 * - エラー時は到達位置で凍結 → 赤 → 退場（100% には到達させない）
 * - 中止時はエラー色にせずフェードのみ
 * - 進捗の読み上げはコンソールに一本化するため aria-hidden（§5.5）
 */

import type { TimelineSnapshot } from "./useAnalysisTimeline";

interface HeroTopProgressBarProps {
  snap: TimelineSnapshot;
  /** prefers-reduced-motion 時は 0/25/50/75/100 の 5 段階のみ（§5.4-4） */
  reduced: boolean;
}

export default function HeroTopProgressBar({ snap, reduced }: HeroTopProgressBarProps) {
  if (!snap.barMounted) return null;

  const cls = ["hc-top-progress"];
  if (snap.barHold) cls.push("is-hold");
  if (snap.barFrozen) cls.push("is-frozen");
  if (snap.barError) cls.push("is-error");
  if (snap.barAbort) cls.push("is-abort");
  if (snap.barFading) cls.push("is-fading");

  const pct = reduced ? snap.barPctReduced : snap.barPct;

  return <div className={cls.join(" ")} style={{ width: `${pct}%` }} aria-hidden="true" />;
}
