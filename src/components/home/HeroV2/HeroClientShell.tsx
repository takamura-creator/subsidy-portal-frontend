"use client";

import { useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import HeroUrlInput from "./HeroUrlInput";
import HeroLivePreview from "./HeroLivePreview";
import HeroAnalysisConsole, { settledConsoleTitle } from "./HeroAnalysisConsole";
import HeroTopProgressBar from "./HeroTopProgressBar";
import HeroSubmitBeam from "./HeroSubmitBeam";
import {
  useAnalysisTimeline,
  nowMs,
  TL,
  type AnalysisRun,
  type StepState,
} from "./useAnalysisTimeline";
import { diagnosePublic, DiagnoseResponse, ApiError } from "@/lib/api";
import { saveDiagnosedUrl } from "@/components/wizard/handoff";

interface HeroClientShellProps {
  /** Server Component（h1+リード）を左カラムに差し込む */
  headingSlot: ReactNode;
}

/**
 * 状態機械（台本 §6.3）— 「解析中表示が残る」不具合の閉塞点。
 * error / aborted では右カードを必ず idle に落とす導出式を snapshot 側で確定させる。
 */
interface RunState {
  run: AnalysisRun;
  url: string;
  status: number | null;
  consecutiveFailures: number;
  /** ラン識別子（ビーム再発火・スクロール一回性・応答の取り違え防止に使用） */
  runKey: number;
}

/**
 * HeroClientShell — 2カラムグリッドのClient境界ルート
 *
 * 左カラム: headingSlot (Server SSR済みh1+リード) + URL入力フォーム + 診断卓 + 補足テキスト
 * 右カラム: HeroLivePreview（デモ/ライブ）
 *
 * mode="demo": マウント時に自動デモループ。
 * mode="live": URL入力フォーカスで即切替。デモへの自動復帰なし。
 * 送信時: diagnosePublic(url, signal) を呼び実データを HeroLivePreview に渡す。
 *
 * 台本『診断卓』（specs/2026-08-01_hero_analyzing_fx_script.md・🔒凍結）:
 *   本コンポーネントが AnalysisState を保有し、100ms tick 1 本（useAnalysisTimeline）が
 *   A/B/S/E/R/A' の全サブシーケンスを導出する。中止は AbortController で実 fetch を中断。
 *   エラー導線はコンソール内へ統合済み（左カラム下部の旧エラーブロックは撤去）。
 */
export default function HeroClientShell({ headingSlot }: HeroClientShellProps) {
  const router = useRouter();
  const prefersReduced = useReducedMotion();
  const [mode, setMode] = useState<"demo" | "live">("demo");
  const [runState, setRunState] = useState<RunState | null>(null);
  const [diagnoseResult, setDiagnoseResult] = useState<DiagnoseResponse | null>(null);

  const snap = useAnalysisTimeline(runState?.run ?? null);

  const tokenRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const runStateRef = useRef<RunState | null>(null);
  const stepsRef = useRef<StepState[] | null>(null);
  const scrolledKeyRef = useRef(-1);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    runStateRef.current = runState;
  }, [runState]);

  useEffect(() => {
    stepsRef.current = snap.steps;
  }, [snap.steps]);

  // アンマウント時は実 fetch も止める（行き止まり・リーク防止）。
  // token を進めてから abort することで、abort 由来の catch が
  // アンマウント済みコンポーネントへ setState する経路を閉じる。
  useEffect(
    () => () => {
      tokenRef.current += 1;
      abortRef.current?.abort();
    },
    [],
  );

  const handleFocus = useCallback(() => {
    setMode("live");
  }, []);

  /** A（初回）/ R（リトライ）共通の起点。attempt>1 なら R シーケンスになる */
  const start = useCallback(
    (
      url: string,
      attempt: number,
      failures: number,
      prevSteps: StepState[] | null,
      prevTitle: string | null,
    ) => {
      const token = tokenRef.current + 1;
      tokenRef.current = token;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const startedAt = nowMs();

      setMode("live");
      setDiagnoseResult(null);
      setRunState({
        run: { kind: "analyzing", startedAt, attempt, settledAt: null, prevSteps, prevTitle },
        url,
        status: null,
        consecutiveFailures: failures,
        runKey: token,
      });

      // 実効開始 = max(応答時刻, 最短表示保証)。早い応答でもコンソールは 1.200s 表示される
      const settleAt = () => Math.max(nowMs(), startedAt + TL.minVisibleMs);

      diagnosePublic(url, controller.signal)
        .then((result) => {
          if (tokenRef.current !== token) return;
          // 診断が成功して初めて URL をウィザードへ引き継ぐ（ユーザー入力のURLのみ・PIIは載せない）。
          // 送信時点で確定させると、打ち間違い→訂正して再送信しても最初のURLが残ってしまう。
          // 保存できなくても診断は続行する（会社情報ステップで手入力に縮退）。
          saveDiagnosedUrl(url);
          setDiagnoseResult(result);
          setRunState((prev) =>
            prev && prev.runKey === token
              ? {
                  ...prev,
                  consecutiveFailures: 0,
                  run: { ...prev.run, kind: "success", settledAt: settleAt() },
                }
              : prev,
          );
        })
        .catch((err: unknown) => {
          if (tokenRef.current !== token) return;
          const status = err instanceof ApiError ? err.status : 0;
          setRunState((prev) =>
            prev && prev.runKey === token
              ? {
                  ...prev,
                  status,
                  consecutiveFailures: prev.consecutiveFailures + 1,
                  run: { ...prev.run, kind: "error", settledAt: settleAt() },
                }
              : prev,
          );
        });
    },
    [],
  );

  /**
   * CTA からの送信。戻り値 true = A（導入シーケンス）＝押し込み・発火リングを再生してよい。
   * false = R（リトライ）。台本 R1-R6 とデモ HTML のリトライ系列は導入演出を含まない。
   */
  const handleSubmit = useCallback(
    (url: string): boolean => {
      const prev = runStateRef.current;
      // success / error からの送信は R（コンソールを閉じない）。idle / aborted は A から
      if (prev && (prev.run.kind === "success" || prev.run.kind === "error")) {
        const failures = prev.url === url ? prev.consecutiveFailures : 0;
        start(
          url,
          prev.run.attempt + 1,
          failures,
          stepsRef.current,
          settledConsoleTitle(prev.run.kind),
        );
        return false;
      }
      start(url, 1, 0, null, null);
      return true;
    },
    [start],
  );

  /** エラー導線「もう一度試す」/「もう一度診断する」（consecutiveFailures 継承） */
  const handleRetry = useCallback(() => {
    const prev = runStateRef.current;
    if (!prev) return;
    start(
      prev.url,
      prev.run.attempt + 1,
      prev.consecutiveFailures,
      stepsRef.current,
      settledConsoleTitle(prev.run.kind),
    );
  }, [start]);

  /** エラー導線「手入力で診断する」（状態遷移なし） */
  const handleManual = useCallback(() => {
    router.push("/match");
  }, [router]);

  /** 終わり方④ 中止 — AbortController で実 fetch を中断する */
  const handleAbort = useCallback(() => {
    tokenRef.current += 1; // 進行中の応答を無効化
    abortRef.current?.abort();
    abortRef.current = null;
    setRunState((prev) =>
      prev ? { ...prev, run: { ...prev.run, kind: "aborted", settledAt: nowMs() } } : prev,
    );
  }, []);

  // S9: モバイルのみ結果カードへスクロール（ラン 1 回だけ）
  useEffect(() => {
    if (!snap.scrollNow || !runState) return;
    if (scrolledKeyRef.current === runState.runKey) return;
    scrolledKeyRef.current = runState.runKey;
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 768px)").matches) return;
    cardRef.current?.scrollIntoView({
      behavior: prefersReduced ? "auto" : "smooth",
      block: "center",
    });
  }, [snap.scrollNow, runState, prefersReduced]);

  return (
    <>
      <HeroTopProgressBar snap={snap} reduced={!!prefersReduced} />

      <div className="hero-v2-grid">
        {/* 左カラム: SSR済みh1+リード + フォーム + 診断卓 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
            justifyContent: "center",
          }}
        >
          {/* Server側のh1+リードをここに展開（LCP SSR即時維持・DOM変更禁止） */}
          {headingSlot}

          {/* URL入力フォーム */}
          <HeroUrlInput
            onSubmit={handleSubmit}
            onFocus={handleFocus}
            busy={snap.busy}
            label={snap.ctaLabel}
            scanning={snap.busy}
          />

          {/* 補足テキスト ⇔ 診断卓（同一スロットで入れ替え。上のh1は動かさない） */}
          <div className="hc-hero-console-slot">
            {runState && <HeroSubmitBeam axis="v" runKey={runState.runKey} />}
            {snap.subNoteVisible && (
              <p className="hc-hero-subnote">登録不要・無料。URLを入れるだけで診断が始まります。</p>
            )}
            {runState && snap.consoleMounted && (
              <HeroAnalysisConsole
                snap={snap}
                url={runState.url}
                attempt={runState.run.attempt}
                status={runState.status}
                consecutiveFailures={runState.consecutiveFailures}
                onAbort={handleAbort}
                onRetry={handleRetry}
                onManual={handleManual}
              />
            )}
          </div>
        </div>

        {/* 右カラム: LivePreview — 上揃え */}
        <div
          ref={cardRef}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            position: "relative",
          }}
        >
          {runState && <HeroSubmitBeam axis="h" runKey={runState.runKey} />}
          <HeroLivePreview
            mode={mode}
            phase={snap.cardPhase}
            url={runState?.url ?? null}
            diagnoseResult={diagnoseResult}
          />
        </div>
      </div>
    </>
  );
}
