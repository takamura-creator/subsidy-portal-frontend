/**
 * motion-tokens.ts — アニメーション定数（Apple 級 easing）
 * art direction v2 準拠: cubic-bezier(0.16,1,0.3,1) + 120ms stagger
 */

/** Apple 準拠の ease-out spring easing */
export const EASING = {
  spring: [0.16, 1, 0.3, 1] as [number, number, number, number],
  standard: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  linear: [0, 0, 1, 1] as [number, number, number, number],
} as const;

/** 出現アニメーション duration (秒) */
export const DURATION = {
  fast: 0.3,
  base: 0.5,
  slow: 0.6,
  livePreview: 2.0,
} as const;

/** stagger delay (秒) */
export const STAGGER = {
  step: 0.12,  // 120ms
} as const;
