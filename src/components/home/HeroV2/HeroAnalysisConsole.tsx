"use client";

/**
 * HeroAnalysisConsole — 診断卓（解析コンソール）本体
 *
 * 台本: specs/2026-08-01_hero_analyzing_fx_script.md（🔒凍結）
 * 文言はすべて §5.1 文言マスターからの一字一句。実装者の創作・意訳は禁止。
 * 工程は 4 段固定・増減禁止（禁止事項1）。フッター注記は削除禁止（禁止事項2）。
 * 解析中に補助金名・件数・金額は出さない（禁止事項5）。
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import type { RunKind, StepState, TimelineSnapshot } from "./useAnalysisTimeline";

/* ---- §5.1 文言マスター（一字一句確定） ---- */

const TITLE = {
  analyzing: "AIが解析しています",
  success: "解析が完了しました",
  error: "解析を完了できませんでした",
  aborted: "解析を中止しました",
} as const;

/**
 * 終端状態のコンソール見出し。リトライ（R3）で +0.180s のあいだ据え置く
 * 「直前ランの見出し」を親が組み立てるために公開する。
 */
export function settledConsoleTitle(kind: RunKind): string | null {
  if (kind === "success") return TITLE.success;
  if (kind === "error") return TITLE.error;
  if (kind === "aborted") return TITLE.aborted;
  return null;
}

const ABORT_LABEL = "中止";
const ABORT_ARIA = "解析を中止する";
const FOOTNOTE = "※ 工程の進み具合は目安表示です。結果は解析完了時にまとめて表示されます。";
const SUMMARY_WIDE = "解析完了 — 結果を右のカードに表示しました";
const SUMMARY_NARROW = "解析完了 — 結果を下に表示しました";
const THIRD_FAILURE = "このサイトからは情報を読み取りにくいようです。手入力での診断が確実です。";
const MANUAL_LABEL = "手入力で診断する";
const RETRY_LABEL = "もう一度試す";

/** 工程ラベル（4段・実パイプライン準拠・増減禁止） */
const STEPS: { label: string; sub: string }[] = [
  { label: "ホームページを取得", sub: "サイトの本文を読み込んでいます" },
  { label: "企業情報をAIで読み取り", sub: "会社名・業種・従業員数・所在地を探しています" },
  { label: "補助金データベースと照合", sub: "登録されている補助金制度と条件を突き合わせています" },
  { label: "概算を算出", sub: "補助率と上限額から目安を計算しています" },
];

/** hold 中の差し替え文（工程3・B5/B6） */
const HOLD_TEXTS = [
  "登録されている補助金制度と条件を突き合わせています",
  "AIが精査しています。そのままお待ちください。",
  "解析を続けています。最大30秒で結果をお返しします。",
];

/** 工程の状態サフィックス（記号＋文字・色だけに意味を持たせない） */
const STATE_SUFFIX: Record<StepState, { mark: string; word: string }> = {
  wait: { mark: "－", word: "待機中" },
  active: { mark: "●", word: "処理中" },
  done: { mark: "✓", word: "完了" },
  error: { mark: "！", word: "中断" },
};

/** エラー理由行と導線（ステータス別・一字一句確定） */
const ERROR_COPY: Record<string, { text: string; primary: string; secondary: string }> = {
  "422": {
    text: "ホームページの情報を読み取れませんでした。",
    primary: MANUAL_LABEL,
    secondary: RETRY_LABEL,
  },
  "429": {
    text: "アクセスが集中しています。1分ほどおいてから、もう一度お試しください。",
    primary: RETRY_LABEL,
    secondary: MANUAL_LABEL,
  },
  "408": {
    text: "30秒以内に解析が終わりませんでした。",
    primary: RETRY_LABEL,
    secondary: MANUAL_LABEL,
  },
  other: {
    text: "通信エラーが発生しました。接続をご確認ください。",
    primary: RETRY_LABEL,
    secondary: MANUAL_LABEL,
  },
};

interface HeroAnalysisConsoleProps {
  snap: TimelineSnapshot;
  url: string;
  attempt: number;
  status: number | null;
  consecutiveFailures: number;
  onAbort: () => void;
  onRetry: () => void;
  onManual: () => void;
}

function formatElapsed(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `経過 ${m}:${String(s).padStart(2, "0")}`;
}

function consoleTitle(snap: TimelineSnapshot, attempt: number): string {
  // R3: +0.180s までは直前ランの見出しを据え置く（回数表示はゲート後）
  if (snap.titleHeld !== null) return snap.titleHeld;
  if (snap.tone === "success") return TITLE.success;
  if (snap.tone === "error") return TITLE.error;
  if (snap.tone === "aborted") return TITLE.aborted;
  return attempt > 1 ? `${TITLE.analyzing}（${attempt}回目）` : TITLE.analyzing;
}

export default function HeroAnalysisConsole({
  snap,
  url,
  attempt,
  status,
  consecutiveFailures,
  onAbort,
  onRetry,
  onManual,
}: HeroAnalysisConsoleProps) {
  // A10「診断卓が開く」: 初回フレームは閉じた状態で描画し、次フレームで is-open を付けて
  // 展開トランジション（CSS 側 delay 120ms / 320ms spring）を実際に走らせる。
  // 本コンポーネントは snap.consoleMounted の間だけ親がマウントするため、
  // A'（中止）で畳んだ後の再送信では必ず閉じた状態から開き直す。
  const [expandable, setExpandable] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setExpandable(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const cls = ["hc-console"];
  if (snap.consoleOpen && expandable) cls.push("is-open");
  if (snap.consoleClosing) cls.push("is-closing");
  if (snap.consoleSummary) cls.push("is-summary");
  if (snap.tone === "error") cls.push("is-error-tone");

  const turtleCls = ["hc-console-turtle"];
  if (snap.turtlePop) turtleCls.push("is-pop");
  else if (snap.turtleNod) turtleCls.push("hc-turtle-nod");
  else if (snap.turtleIdle) turtleCls.push("is-peek");

  const titleCls = ["hc-console-title"];
  if (snap.tone === "error") titleCls.push("is-error");
  if (snap.tone === "aborted") titleCls.push("is-aborted");

  const err = ERROR_COPY[String(status ?? 0)] ?? ERROR_COPY.other;
  const forced = consecutiveFailures >= 3;
  const primaryLabel = forced ? MANUAL_LABEL : err.primary;
  const secondaryLabel = forced ? RETRY_LABEL : err.secondary;
  const doneCount = snap.steps.filter((s) => s === "done").length;

  return (
    <section
      className={cls.join(" ")}
      role="status"
      aria-live="polite"
      aria-atomic="false"
      aria-label="解析の進行状況"
    >
      <div className="hc-console-head">
        <span className={turtleCls.join(" ")} aria-hidden="true">
          <Image
            src={snap.turtleCelebration ? "/images/turtle_celebration.png" : "/images/turtle_search.png"}
            alt=""
            width={44}
            height={44}
          />
        </span>
        <h2 className={titleCls.join(" ")}>{consoleTitle(snap, attempt)}</h2>
        <span className="hc-console-elapsed" aria-hidden="true">
          {formatElapsed(snap.elapsedSec)}
        </span>
        {snap.abortable && (
          <button type="button" className="hc-console-abort" aria-label={ABORT_ARIA} onClick={onAbort}>
            {ABORT_LABEL}
          </button>
        )}
      </div>

      <p className="hc-console-target">対象: {url}</p>

      {/* 画面内で唯一の progressbar（右カードは aria-hidden・禁止事項13） */}
      <span
        className="hc-sr-only"
        role="progressbar"
        aria-label="解析の進行状況"
        aria-valuemin={0}
        aria-valuemax={STEPS.length}
        aria-valuenow={doneCount}
      />

      <ol className="hc-step-list">
        {STEPS.map((step, i) => {
          const state = snap.steps[i] ?? "wait";
          const suffix = STATE_SUFFIX[state];
          const sub = i === 2 ? HOLD_TEXTS[snap.holdIndex] : step.sub;
          return (
            <li
              key={step.label}
              className={`hc-step${snap.stepsDimming ? " is-dimming" : ""}`}
              data-state={state}
              aria-current={state === "active" ? "step" : undefined}
              style={snap.stepsDimming ? { transitionDelay: `${i * 40}ms` } : undefined}
            >
              <span className="hc-step-row">
                <span className="hc-step-label">{step.label}</span>
                <span className="hc-step-suffix">
                  <span aria-hidden="true">{suffix.mark}</span> {suffix.word}
                </span>
              </span>
              <span className="hc-step-sub">
                <span key={i === 2 ? snap.holdIndex : 0} className="hc-step-sub-text">
                  {sub}
                </span>
              </span>
            </li>
          );
        })}
      </ol>

      {snap.showErrorBlock && (
        <div className="hc-console-error">
          <p className="hc-console-reason" role="alert">
            {err.text}
          </p>
          <div className="hc-console-actions">
            <button
              type="button"
              className="hc-btn-sm hc-btn-sm-primary"
              onClick={primaryLabel === MANUAL_LABEL ? onManual : onRetry}
            >
              {primaryLabel}
            </button>
            <button
              type="button"
              className="hc-btn-sm hc-btn-sm-secondary"
              onClick={secondaryLabel === MANUAL_LABEL ? onManual : onRetry}
            >
              {secondaryLabel}
            </button>
          </div>
          {forced && <p className="hc-console-3rd">{THIRD_FAILURE}</p>}
        </div>
      )}

      {snap.consoleSummary && (
        <p className="hc-console-summary">
          <span className="hc-summary-wide">{SUMMARY_WIDE}</span>
          <span className="hc-summary-narrow">{SUMMARY_NARROW}</span>
        </p>
      )}

      {/* 誠実性の要。削除・縮小・移動禁止（禁止事項2） */}
      <p className="hc-console-note">{FOOTNOTE}</p>
    </section>
  );
}
