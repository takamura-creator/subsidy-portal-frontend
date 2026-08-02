"use client";

/**
 * useAnalysisTimeline — 診断卓（解析中演出）の単一タイムライン
 *
 * 台本: specs/2026-08-01_hero_analyzing_fx_script.md（🔒凍結・2026-08-02 トニー承認）
 * 本ファイルの時刻定数は台本 Phase 3 / 5.2 の確定値。禁止事項14により変更禁止
 * （変更が必要な場合は hayao へ Phase 3 差し戻し）。
 *
 * 禁止事項9「タイマーは 100ms tick の 1 本」を守るため、
 * A/B/S/E/R/A' の全サブシーケンスは `now - startedAt` / `now - settledAt` の
 * 純関数（computeSnapshot）として導出する。工程ごとの setTimeout は積まない。
 */

import { useEffect, useState } from "react";

export type StepState = "wait" | "active" | "done" | "error";
export type RunKind = "analyzing" | "success" | "error" | "aborted";
export type CardPhase = "idle" | "analyzing" | "done";
export type ConsoleTone = "analyzing" | "success" | "error" | "aborted";

export interface AnalysisRun {
  kind: RunKind;
  /** submit を t=0 とする基準時刻（performance.now()） */
  startedAt: number;
  /** 1=初回（A→B） / 2以上=リトライ（R→B） */
  attempt: number;
  /** S / E / A' サブシーケンスの実効開始。最短表示保証 1.320s 適用済 */
  settledAt: number | null;
  /** 直前ランの工程表示（R1 の消灯に使用） */
  prevSteps: StepState[] | null;
  /** 直前ランのコンソール見出し（R3 の +0.180s ゲート中に据え置く文言） */
  prevTitle: string | null;
}

/** 台本の確定 t 値（ms）。変更禁止（禁止事項14） */
export const TL = {
  tickMs: 100, // §5.2 tick.interval_ms
  minVisibleMs: 1320, // A10(0.120) + guards.min_visible_ms(1200)
  barMountFresh: 80, // A7
  barMountRetry: 200, // R5
  turtleNodFresh: 150, // A11
  turtleNodRetry: 200, // R4
  peekFrom: 450,
  stepBaseFresh: 350, // B1
  stepBaseRetry: 250, // R6
  step2At: 1250, // B2 = base + 1250
  step3At: 3850, // B3 = base + 3850
  holdText1At: 5800, // B5（fresh で t=10.000）
  holdText2At: 15800, // B6（fresh で t=20.000）
  holdSpanMs: 25800, // 4.200 → 30.000 で 58% → 88%
  reducedBar75At: 12900, // reduced-motion の 3段目（hold 開始からの経過）
  retryDimMs: 160, // R1
  retryTitleAt: 180, // R3（見出しの回数表示はここまで直前ランの見出しを据え置く）
  abortSubNoteAt: 580, // A'4（補足文はコンソールが消滅してから復帰させる）
  collapseStepMs: 90, // guards.collapse_step_ms
} as const;

/** 上端バーの確定値（%）。応答前 88% 上限・100% は成功時のみ（禁止事項4） */
const BAR = { start: 8, step2: 28, step3: 58, cap: 88, full: 100 } as const;

/** CTAボタン文言（§5.1 文言マスター・一字一句確定） */
export const CTA_LABEL = {
  idle: "無料で診断を始める",
  busy: "解析中…",
  again: "もう一度診断する",
} as const;

export interface TimelineSnapshot {
  elapsedSec: number;
  steps: StepState[];
  stepsDimming: boolean;
  holdIndex: number;
  barMounted: boolean;
  barPct: number;
  barPctReduced: number;
  barError: boolean;
  barFrozen: boolean;
  barFading: boolean;
  barHold: boolean;
  barAbort: boolean;
  tone: ConsoleTone;
  consoleMounted: boolean;
  consoleOpen: boolean;
  consoleClosing: boolean;
  consoleSummary: boolean;
  showErrorBlock: boolean;
  /** R3: 非 null の間はこの文言を見出しに据え置く（回数表示は +0.180s まで出さない） */
  titleHeld: string | null;
  turtleCelebration: boolean;
  turtlePop: boolean;
  turtleIdle: boolean;
  turtleNod: boolean;
  cardPhase: CardPhase;
  busy: boolean;
  abortable: boolean;
  ctaLabel: string;
  subNoteVisible: boolean;
  scrollNow: boolean;
  finished: boolean;
}

export const IDLE_SNAPSHOT: TimelineSnapshot = {
  elapsedSec: 0,
  steps: ["wait", "wait", "wait", "wait"],
  stepsDimming: false,
  holdIndex: 0,
  barMounted: false,
  barPct: 0,
  barPctReduced: 0,
  barError: false,
  barFrozen: false,
  barFading: false,
  barHold: false,
  barAbort: false,
  tone: "analyzing",
  consoleMounted: false,
  consoleOpen: false,
  consoleClosing: false,
  consoleSummary: false,
  showErrorBlock: false,
  titleHeld: null,
  turtleCelebration: false,
  turtlePop: false,
  turtleIdle: false,
  turtleNod: false,
  cardPhase: "idle",
  busy: false,
  abortable: false,
  ctaLabel: CTA_LABEL.idle,
  subNoteVisible: true,
  scrollNow: false,
  finished: true,
};

export function nowMs(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function stepBase(attempt: number): number {
  return attempt > 1 ? TL.stepBaseRetry : TL.stepBaseFresh;
}

/** B シーケンスの工程状態（工程4は応答受信まで必ず wait＝禁止事項3） */
function analyzingSteps(t: number, base: number): StepState[] {
  const s2 = base + TL.step2At;
  const s3 = base + TL.step3At;
  return [
    t >= s2 ? "done" : t >= base ? "active" : "wait",
    t >= s3 ? "done" : t >= s2 ? "active" : "wait",
    t >= s3 ? "active" : "wait",
    "wait",
  ];
}

function holdIndexAt(t: number, base: number): number {
  const s3 = base + TL.step3At;
  if (t >= s3 + TL.holdText2At) return 2;
  if (t >= s3 + TL.holdText1At) return 1;
  return 0;
}

/** 上端バー幅（%）。応答前は BAR.cap(88) を超えない */
function analyzingBar(t: number, attempt: number): number {
  const base = stepBase(attempt);
  const eightAt = attempt > 1 ? base : TL.barMountFresh;
  if (t < eightAt) return 0;
  if (t < base + TL.step2At) return BAR.start;
  if (t < base + TL.step3At) return BAR.step2;
  const held = BAR.step3 + ((BAR.cap - BAR.step3) * (t - (base + TL.step3At))) / TL.holdSpanMs;
  return Math.min(BAR.cap, held);
}

/** reduced-motion 用の 5 段階離散バー（§5.4-4） */
function analyzingBarReduced(t: number, attempt: number): number {
  const base = stepBase(attempt);
  const eightAt = attempt > 1 ? base : TL.barMountFresh;
  const s3 = base + TL.step3At;
  if (t < eightAt) return 0;
  if (t < s3) return 25;
  if (t < s3 + TL.reducedBar75At) return 50;
  return 75;
}

export function computeSnapshot(run: AnalysisRun | null, now: number): TimelineSnapshot {
  if (!run) return IDLE_SNAPSHOT;

  const t = now - run.startedAt;
  const retry = run.attempt > 1;
  const base = stepBase(run.attempt);
  const settled = run.settledAt !== null;
  const u = settled ? now - (run.settledAt as number) : -1;

  // 応答が最短表示保証(1.320s)より早く来た場合、u<0 の間は A/B 表示を継続する
  if (!settled || u < 0) {
    const dimming = retry && t < TL.retryDimMs && run.prevSteps !== null;
    const nodFrom = retry ? TL.turtleNodRetry : TL.turtleNodFresh;
    return {
      ...IDLE_SNAPSHOT,
      elapsedSec: Math.max(0, Math.floor(t / 1000)),
      steps: dimming ? (run.prevSteps as StepState[]) : analyzingSteps(t, base),
      stepsDimming: dimming,
      holdIndex: holdIndexAt(t, base),
      barMounted: t >= (retry ? TL.barMountRetry : TL.barMountFresh),
      barPct: analyzingBar(t, run.attempt),
      barPctReduced: analyzingBarReduced(t, run.attempt),
      barHold: t >= base + TL.step3At,
      tone: "analyzing",
      consoleMounted: true,
      consoleOpen: true,
      // R3: リトライの見出し「（n回目）」は +0.180s まで出さず、直前ランの見出しを据え置く
      // （色は t=0 で解析中＝--hc-primary へ戻す。デモ HTML と同一挙動）
      titleHeld: retry && t < TL.retryTitleAt ? run.prevTitle : null,
      turtleIdle: t >= TL.peekFrom,
      turtleNod: t >= nodFrom && t < nodFrom + 300,
      cardPhase: "analyzing",
      busy: true,
      abortable: run.kind === "analyzing",
      ctaLabel: CTA_LABEL.busy,
      subNoteVisible: false,
      finished: false,
    };
  }

  const tS = (run.settledAt as number) - run.startedAt;
  const atSettle = analyzingSteps(tS, base);
  const frozenBar = analyzingBar(tS, run.attempt);
  const frozenBarReduced = analyzingBarReduced(tS, run.attempt);
  const elapsedSec = Math.max(0, Math.floor(tS / 1000));
  const holdIndex = holdIndexAt(tS, base);

  // --- 終わり方 ①：成功（S） ---
  if (run.kind === "success") {
    const steps = [...atSettle];
    let rank = 0;
    for (let i = 0; i < 3; i += 1) {
      if (atSettle[i] === "done") continue;
      if (u >= rank * TL.collapseStepMs) steps[i] = "done"; // S1
      rank += 1;
    }
    steps[3] = u >= 360 ? "done" : u >= 90 ? "active" : "wait"; // S2 / S3
    return {
      ...IDLE_SNAPSHOT,
      elapsedSec,
      steps,
      holdIndex,
      barMounted: u < 1520, // S10
      barPct: u >= 420 ? BAR.full : frozenBar, // S5: 100% 到達は成功時のみ
      barPctReduced: u >= 420 ? BAR.full : frozenBarReduced,
      barFading: u >= 1220,
      tone: u >= 420 ? "success" : "analyzing", // S4
      consoleMounted: true,
      consoleOpen: true,
      consoleSummary: u >= 1020, // S8
      turtleCelebration: u >= 420,
      turtlePop: u >= 420,
      turtleIdle: u < 420,
      cardPhase: u >= 550 ? "done" : "analyzing", // S6
      busy: u < 1300, // S11
      ctaLabel: u >= 1300 ? CTA_LABEL.again : CTA_LABEL.busy,
      subNoteVisible: false,
      scrollNow: u >= 1100 && u < 1600, // S9
      finished: u >= 1600,
    };
  }

  // --- 終わり方 ②：エラー（E） ---
  if (run.kind === "error") {
    return {
      ...IDLE_SNAPSHOT,
      elapsedSec,
      // E2: 進行中だった工程のみ「！ 中断」。完了済みの ✓ は残す
      steps: atSettle.map((s) => (s === "active" ? "error" : s)),
      holdIndex,
      barMounted: u < 670, // E8
      barPct: frozenBar, // E1: その場で凍結。100% には決して到達させない
      barPctReduced: frozenBarReduced,
      barError: u >= 120, // E3
      barFrozen: true,
      barFading: u >= 320,
      tone: u >= 200 ? "error" : "analyzing", // E4
      consoleMounted: true,
      consoleOpen: true,
      showErrorBlock: u >= 250, // E5
      turtleIdle: u < 200, // E4: 亀は静止
      cardPhase: u >= 300 ? "idle" : "analyzing", // E6: 右カードを必ず idle へ
      busy: u < 300, // E7
      ctaLabel: u >= 300 ? CTA_LABEL.again : CTA_LABEL.busy,
      subNoteVisible: false,
      finished: u >= 670,
    };
  }

  // --- 終わり方 ④：中止（A'） ---
  return {
    ...IDLE_SNAPSHOT,
    elapsedSec,
    steps: ["wait", "wait", "wait", "wait"], // A'1
    holdIndex,
    barMounted: u < 250, // A'2
    barPct: frozenBar,
    barPctReduced: frozenBarReduced,
    barFading: true, // エラー色にしない
    barAbort: true,
    tone: "aborted",
    consoleMounted: u < TL.abortSubNoteAt, // A'4
    consoleOpen: u < 300,
    consoleClosing: u >= 300,
    cardPhase: u >= 300 ? "idle" : "analyzing", // A'3
    busy: u < 300,
    ctaLabel: u >= 300 ? CTA_LABEL.idle : CTA_LABEL.busy,
    // A'4: 補足文はコンソールが畳み切ってアンマウントした後に復帰させる
    //（+0.300 で戻すと閉じかけのコンソールと同一スロット内で 280ms 重複表示になる）
    subNoteVisible: u >= TL.abortSubNoteAt,
    finished: u >= TL.abortSubNoteAt,
  };
}

/**
 * 100ms tick 1 本で全演出を駆動する（禁止事項9）。
 * スナップショットは描画時に純関数で導出し、tick は再描画のトリガのみを担う。
 * これにより run 切替（submit / 応答 / 中止）は tick を待たず即時反映される。
 */
export function useAnalysisTimeline(run: AnalysisRun | null): TimelineSnapshot {
  const [, setTick] = useState(0);

  const snap = computeSnapshot(run, nowMs());
  const running = run !== null && !snap.finished;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick((n) => (n + 1) % 1000000), TL.tickMs);
    return () => clearInterval(id);
  }, [running]);

  return snap;
}
