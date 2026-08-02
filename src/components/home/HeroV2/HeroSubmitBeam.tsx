"use client";

/**
 * HeroSubmitBeam — 送信ビーム（視線の橋渡し）
 *
 * 台本 A8: 幅6px の緑グラデ帯が「ボタン右端 → プレビューカード左端」へ横断
 *   デスクトップ 240ms / cubic-bezier(0.4,0,0.2,1)
 *   モバイル(<768px) は縦（フォーム下端 → コンソール上端 / 180ms）
 * R2: リトライ時に再発火（A8 と同一仕様）。
 *
 * 発火タイミング t=0.100 は CSS の animation-delay で保持（100ms tick に依存しない）。
 * 横/縦の出し分けはメディアクエリ。1 回再生で自己アンマウントする。
 */

import { useState } from "react";

interface HeroSubmitBeamProps {
  /** "h"=デスクトップ（右カラム内）／"v"=モバイル（フォーム直下） */
  axis: "h" | "v";
  /** ラン識別子。変化で再発火する */
  runKey: number;
}

export default function HeroSubmitBeam({ axis, runKey }: HeroSubmitBeamProps) {
  // 再生済みのラン識別子を保持（描画時比較。runKey が変われば自動で再発火する）
  const [playedKey, setPlayedKey] = useState<number | null>(null);

  if (playedKey === runKey) return null;

  return (
    <span
      key={runKey}
      className={`hc-submit-beam hc-submit-beam-${axis}`}
      aria-hidden="true"
      onAnimationEnd={() => setPlayedKey(runKey)}
    />
  );
}
