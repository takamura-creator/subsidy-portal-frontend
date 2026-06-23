"use client";

/**
 * HeroDemoTimeline — 自動デモループ表示（6カット・7.8秒/周）
 * 台本: 演出・プロデューサー責任者/出力/2026-06-21_hero自動デモ_演出台本.md
 *
 * 既存部品のみ使用: TypeWriter / ScaleIn(相当variants) / framer-motion
 * 新規モーション自作禁止（P1）。easing/stagger は motion-tokens.ts から import。
 * 景表法: 金額13px以下・カウントアップ禁止・「※デモ表示」常時（P4）。
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TypeWriter from "@/components/motion/TypeWriter";
import { formatRate } from "@/lib/formatRate";
import { EASING, STAGGER } from "@/lib/motion-tokens";

/** デモフェーズ定義 */
type DemoPhase =
  | "c1_typing"    // 0.0s: URLタイピング
  | "c2_scan"      // 1.6s: スキャン
  | "c3_company"   // 3.0s: ①企業情報
  | "c4_subsidy"   // 3.6s: ②補助金（山場）
  | "c5_draft"     // 5.2s: ③申請書チェック
  | "c6_estimate"  // 6.4s: ④見積り
  | "hold"         // 7.2s: HOLD
  | "fadeout";     // 7.8s: FADE OUT → ループ

// カットタイムライン(ms)
const TIMELINE: Array<{ phase: DemoPhase; at: number }> = [
  { phase: "c1_typing",   at: 0 },
  { phase: "c2_scan",     at: 1600 },
  { phase: "c3_company",  at: 3000 },
  { phase: "c4_subsidy",  at: 3600 },
  { phase: "c5_draft",    at: 5200 },
  { phase: "c6_estimate", at: 6400 },
  { phase: "hold",        at: 7200 },
  { phase: "fadeout",     at: 7800 },
];
const LOOP_MS = 8200; // fadeout後にリセット

const STEP_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: (delay: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay, ease: EASING.spring },
  }),
};
const SCALE_VARIANTS = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] as [number,number,number,number] },
  },
};
const CHECK_ITEM_VARIANTS = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.3, delay: i * STAGGER.step, ease: EASING.spring },
  }),
};

const DEMO_URL = "https://example.co.jp";
const CHECK_ITEMS = ["事業計画", "設備導入の目的", "費用内訳"];

interface HeroDemoTimelineProps {
  /** 親から停止指示（focus/submit）が来たら true */
  stopped: boolean;
  /** アドレスバー用クラス ref 注入（1周1回の border 明滅） */
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export default function HeroDemoTimeline({ stopped, inputRef }: HeroDemoTimelineProps) {
  const [phase, setPhase] = useState<DemoPhase>("c1_typing");
  const [scanProgress, setScanProgress] = useState(0);
  const [bodyVisible, setBodyVisible] = useState(true);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearAll() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }

  function scheduleLoop() {
    clearAll();
    setPhase("c1_typing");
    setScanProgress(0);
    setBodyVisible(true);

    TIMELINE.forEach(({ phase: p, at }) => {
      const id = setTimeout(() => {
        if (p === "c2_scan") setScanProgress(0);
        if (p === "fadeout") setBodyVisible(false);
        setPhase(p);
      }, at);
      timersRef.current.push(id);
    });

    // プログレスバー進行（c2_scan 中: 1600〜3000ms = 1400ms で 0→95%）
    const SCAN_START = 1600;
    const SCAN_DUR = 1400;
    const TICK = 60;
    const stepVal = 95 / (SCAN_DUR / TICK);
    let prog = 0;
    const scanId = setInterval(() => {
      prog = Math.min(prog + stepVal, 95);
      setScanProgress(prog);
    }, TICK);
    timersRef.current.push(scanId as unknown as ReturnType<typeof setTimeout>);

    // 3000ms で 100% にして interval を止める
    const scanDoneId = setTimeout(() => {
      clearInterval(scanId);
      setScanProgress(100);
    }, SCAN_START + SCAN_DUR);
    timersRef.current.push(scanDoneId);

    // ループ先頭に戻る前に input border を一瞬 primary に
    const pulseId = setTimeout(() => {
      if (inputRef?.current) {
        inputRef.current.style.borderColor = "var(--hc-primary)";
        const resetId = setTimeout(() => {
          if (inputRef?.current) inputRef.current.style.borderColor = "var(--hc-border)";
        }, 300);
        timersRef.current.push(resetId);
      }
    }, LOOP_MS - 400);
    timersRef.current.push(pulseId);

    // ループ再起動
    const loopId = setTimeout(() => scheduleLoop(), LOOP_MS);
    timersRef.current.push(loopId);
  }

  useEffect(() => {
    if (stopped) { clearAll(); return; }
    scheduleLoop();
    return clearAll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopped]);

  const showScan      = phase === "c2_scan";
  const showCompany   = ["c3_company","c4_subsidy","c5_draft","c6_estimate","hold","fadeout"].includes(phase);
  const showSubsidy   = ["c4_subsidy","c5_draft","c6_estimate","hold","fadeout"].includes(phase);
  const showDraft     = ["c5_draft","c6_estimate","hold","fadeout"].includes(phase);
  const showEstimate  = ["c6_estimate","hold","fadeout"].includes(phase);
  const isTypingDone  = phase !== "c1_typing";

  return (
    <AnimatePresence>
      {bodyVisible && (
        <motion.div
          key="demo-body"
          initial={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6, transition: { duration: 0.4, ease: EASING.spring } }}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          {/* C1: アドレスバー TypeWriter */}
          <div style={{ fontSize: 11, color: "var(--hc-text-muted)", fontFamily: "'Sora', 'Noto Sans JP', sans-serif" }}>
            {phase === "c1_typing"
              ? <TypeWriter text={DEMO_URL} speed={40} showCursor cursorColor="var(--hc-text-muted)" once={false} />
              : <span>{DEMO_URL}</span>
            }
            {isTypingDone && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, ease: EASING.spring }}
                style={{ marginLeft: 8, color: "var(--hc-primary)", fontSize: 10, fontWeight: 600 }}
              >
                解析中…
              </motion.span>
            )}
          </div>

          {/* C2: スキャン */}
          {showScan && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <p style={{ fontSize: 13, color: "var(--hc-primary)", fontWeight: 600, margin: 0 }}>
                <TypeWriter text="AIが御社のサイトを解析中..." speed={35} once={false} />
              </p>
              <p style={{ fontSize: 11, color: "var(--hc-text-muted)", margin: 0 }}>完了見込み: 約2秒</p>
              <div role="progressbar" aria-valuenow={Math.round(scanProgress)} aria-valuemin={0} aria-valuemax={100}
                aria-label="解析中" style={{ height: 3, background: "var(--hc-border)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${scanProgress}%`, background: "var(--hc-primary)", transition: "width 0.06s linear" }} />
              </div>
              {[80, 60, 90, 45].map((w, i) => (
                <div key={i} className="skeleton" style={{ height: 13, width: `${w}%`, borderRadius: 4 }} />
              ))}
            </div>
          )}

          {/* C3: ①企業情報 */}
          {showCompany && (
            <motion.div custom={0} variants={STEP_VARIANTS} initial="hidden" animate="visible"
              style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontSize: 10, color: "var(--hc-text-muted)", fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
                letterSpacing: "0.08em", textTransform: "uppercase" }}>企業情報</span>
              <div style={{ fontSize: 13, color: "var(--hc-navy)", fontWeight: 600 }}>
                製造業・従業員 50名・東京都
              </div>
            </motion.div>
          )}

          {/* C4: ②補助金（山場・ScaleIn + 1回パルス） */}
          {showSubsidy && (
            <motion.div variants={SCALE_VARIANTS} initial="hidden" animate="visible">
              <div style={{
                padding: "10px 14px",
                background: "color-mix(in srgb, var(--hc-primary) 8%, var(--hc-white))",
                border: "1px solid var(--hc-primary-line)",
                borderRadius: 8,
              }}>
                <span style={{ fontSize: 10, color: "var(--hc-primary)", fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
                  letterSpacing: "0.08em", textTransform: "uppercase" }}>マッチした補助金</span>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--hc-primary)", marginTop: 4 }}>
                  <TypeWriter text="3件 見つかりました" speed={40} once={false} />
                </div>
                {/* 1回パルス（ButtonPulse 相当・repeat:1） */}
                <motion.div
                  animate={{ boxShadow: ["0 0 0 0 color-mix(in srgb,var(--hc-primary) 30%,transparent)",
                    "0 0 0 8px transparent"] }}
                  transition={{ duration: 0.5, repeat: 0, delay: 0.6 }}
                  style={{ position: "absolute", inset: 0, borderRadius: 8, pointerEvents: "none" }}
                />
              </div>
            </motion.div>
          )}

          {/* C5: ③申請書 チェックリスト（stagger 連続点灯） */}
          {showDraft && (
            <motion.div custom={2} variants={STEP_VARIANTS} initial="hidden" animate="visible"
              style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 10, color: "var(--hc-text-muted)", fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
                letterSpacing: "0.08em", textTransform: "uppercase" }}>申請書ドラフト</span>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {CHECK_ITEMS.map((item, i) => (
                  <motion.div key={item} custom={i} variants={CHECK_ITEM_VARIANTS}
                    initial="hidden" animate="visible"
                    style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--hc-text)" }}>
                    <motion.span
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: i * STAGGER.step + 0.05, ease: EASING.spring }}
                      style={{ color: "var(--hc-primary)", fontWeight: 700, fontSize: 13, lineHeight: 1 }}
                    >✓</motion.span>
                    {item}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* C6: ④概算見積り（控えめ fade のみ・カウントアップ禁止） */}
          {showEstimate && (
            <motion.div custom={3} variants={STEP_VARIANTS} initial="hidden" animate="visible"
              style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 10, color: "var(--hc-text-muted)", fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
                letterSpacing: "0.08em", textTransform: "uppercase" }}>概算見積り</span>
              <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                {/* 13px 上限維持・カウントアップ禁止 */}
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--hc-navy)", fontFamily: "'Sora', 'Noto Sans JP', sans-serif" }}>
                  上限額（目安）: ¥740,000
                </span>
                <span style={{ fontSize: 11, color: "var(--hc-text-muted)" }}>
                  {formatRate(50, 75)} 補助
                </span>
              </div>
              <p className="mc-disclaimer">
                ※これはデモ表示です。実際の診断結果は企業情報に基づき異なります。<br />
                ※制度・条件により異なります。出典：公式資料。診断は目安です。
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
