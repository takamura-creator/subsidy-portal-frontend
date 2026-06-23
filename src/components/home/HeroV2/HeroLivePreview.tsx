"use client";

/**
 * HeroLivePreview — デモ/ライブ分岐ハブ
 *
 * mode="demo": HeroDemoTimeline（7.8秒/周 自動ループ）を表示
 * mode="live": url prop 駆動の実解析表示（idle→analyzing→done）
 *
 * useReducedMotion 時: デモ起動せず done 静止1枚（P3）
 * 景表法ガード: 金額13px以下・mc-disclaimer 常時（P4）
 */

import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import TypeWriter from "@/components/motion/TypeWriter";
import HeroDemoTimeline from "./HeroDemoTimeline";
import { EASING, DURATION, STAGGER } from "@/lib/motion-tokens";
import { formatRate } from "@/lib/formatRate";

type LivePhase = "idle" | "analyzing" | "done";

interface HeroLivePreviewProps {
  mode: "demo" | "live";
  url: string | null;
}

const TRAFFIC_LIGHTS = [
  { color: "#EF4444", label: "close" },
  { color: "#F59E0B", label: "minimize" },
  { color: "#22C55E", label: "maximize" },
] as const;

const STEP_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const OVERLINE_STYLE: React.CSSProperties = {
  fontSize: 10,
  color: "var(--hc-text-muted)",
  fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

export default function HeroLivePreview({ mode, url }: HeroLivePreviewProps) {
  const prefersReduced = useReducedMotion();
  const [livePhase, setLivePhase] = useState<LivePhase>("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // live モード: url 変化 → analyzing → done
  useEffect(() => {
    if (mode !== "live") return;
    if (!url) { setLivePhase("idle"); return; }
    setLivePhase("analyzing");
    setScanProgress(0);
    const stepVal = 95 / (DURATION.livePreview * 1000 / 60);
    progressRef.current = setInterval(() => {
      setScanProgress((p) => Math.min(p + stepVal, 95));
    }, 60);
    const timer = setTimeout(() => {
      if (progressRef.current) clearInterval(progressRef.current);
      setScanProgress(100);
      setLivePhase("done");
    }, DURATION.livePreview * 1000);
    return () => {
      clearTimeout(timer);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [mode, url]);

  const demoStopped = mode === "live" || !!prefersReduced;

  return (
    <div style={{
      width: "100%", maxWidth: 480, background: "var(--hc-white)",
      border: "1px solid var(--hc-border)", borderRadius: 12, overflow: "hidden",
      boxShadow: "0 0 0 1px rgba(0,0,0,0.04), var(--hc-shadow-md)",
    }}>
      {/* ブラウザ chrome */}
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "10px 14px", borderBottom: "1px solid var(--hc-border)",
        background: "color-mix(in srgb, var(--hc-primary) 3%, var(--hc-white))",
      }}>
        {TRAFFIC_LIGHTS.map(({ color, label }) => (
          <span key={label} aria-hidden="true"
            style={{ width: 10, height: 10, borderRadius: "50%", background: color, display: "inline-block" }} />
        ))}
        <span style={{
          flex: 1, marginLeft: 8, fontSize: 11, color: "var(--hc-text-muted)",
          fontFamily: "'Sora', 'Noto Sans JP', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {mode === "live" && url ? url : "example.co.jp"}
        </span>
      </div>

      {/* プログレスバー（live analyzing のみ） */}
      {mode === "live" && livePhase === "analyzing" && (
        <div role="progressbar" aria-valuenow={Math.round(scanProgress)}
          aria-valuemin={0} aria-valuemax={100} aria-label="解析中"
          style={{ height: 3, background: "var(--hc-border)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${scanProgress}%`,
            background: "var(--hc-primary)", transition: "width 0.06s linear" }} />
        </div>
      )}
      {mode === "live" && livePhase === "done" && (
        <div style={{ height: 3, background: "var(--hc-primary)", opacity: 0.3 }} />
      )}

      {/* 本体 */}
      <div style={{ padding: "20px 18px", minHeight: 220, position: "relative" }}>

        {/* デモモード */}
        {mode === "demo" && !prefersReduced && (
          <HeroDemoTimeline stopped={demoStopped} />
        )}

        {/* reduced-motion: done 静止1枚 */}
        {prefersReduced && <ReducedFallback />}

        {/* ライブモード */}
        {mode === "live" && (
          <>
            {livePhase === "idle" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", height: 180, gap: 10, color: "var(--hc-text-muted)" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" stroke="var(--hc-border)" strokeWidth="2" />
                  <path d="M21 21l-4.35-4.35" stroke="var(--hc-border)" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <p style={{ fontSize: 13, margin: 0 }}>URLを入力すると解析が始まります</p>
              </div>
            )}
            {livePhase === "analyzing" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <p style={{ fontSize: 13, color: "var(--hc-primary)", fontWeight: 600, margin: 0 }}>
                  <TypeWriter text="AIが御社のサイトを解析中..." speed={40} />
                </p>
                <p style={{ fontSize: 11, color: "var(--hc-text-muted)", margin: 0 }}>完了見込み: 約2秒</p>
                {[80, 60, 90, 40].map((w, i) => (
                  <div key={i} className="skeleton" style={{ height: 14, width: `${w}%`, borderRadius: 4 }} />
                ))}
              </div>
            )}
            {livePhase === "done" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[<CompanyInfo key="c" />, <SubsidyCard key="s" />, <DraftInfo key="d" />, <EstimateInfo key="e" />]
                  .map((el, i) => <LiveStep key={i} index={i}>{el}</LiveStep>)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function LiveStep({ index, children }: { index: number; children: React.ReactNode }) {
  const prefersReduced = useReducedMotion();
  if (prefersReduced) return <div>{children}</div>;
  return (
    <motion.div variants={STEP_VARIANTS} initial="hidden" animate="visible"
      transition={{ duration: 0.5, delay: index * STAGGER.step, ease: EASING.spring }}>
      {children}
    </motion.div>
  );
}

function CompanyInfo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span style={OVERLINE_STYLE}>企業情報</span>
      <div style={{ fontSize: 13, color: "var(--hc-navy)", fontWeight: 600 }}>製造業・従業員 50名・東京都</div>
    </div>
  );
}

function SubsidyCard() {
  return (
    <div style={{ padding: "10px 14px",
      background: "color-mix(in srgb, var(--hc-primary) 8%, var(--hc-white))",
      border: "1px solid var(--hc-primary-line)", borderRadius: 8 }}>
      <span style={{ ...OVERLINE_STYLE, color: "var(--hc-primary)" }}>マッチした補助金</span>
      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--hc-primary)", marginTop: 4 }}>
        <TypeWriter text="3件 見つかりました" speed={40} />
      </div>
    </div>
  );
}

function DraftInfo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={OVERLINE_STYLE}>申請書ドラフト</span>
      <div style={{ fontSize: 12, color: "var(--hc-text)", lineHeight: 1.6 }}>
        <TypeWriter text="事業計画・設備導入の目的・費用内訳を自動生成しました。" speed={20} />
      </div>
    </div>
  );
}

function EstimateInfo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={OVERLINE_STYLE}>概算見積り</span>
      <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--hc-navy)", fontFamily: "'Sora', 'Noto Sans JP', sans-serif" }}>
          上限額（目安）: ¥740,000
        </span>
        <span style={{ fontSize: 11, color: "var(--hc-text-muted)" }}>{formatRate(50, 75)} 補助</span>
      </div>
      <p className="mc-disclaimer">
        ※これはデモ表示です。実際の診断結果は企業情報に基づき異なります。<br />
        ※制度・条件により異なります。出典：公式資料。診断は目安です。
      </p>
    </div>
  );
}

function ReducedFallback() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <CompanyInfo /><SubsidyCard /><DraftInfo /><EstimateInfo />
    </div>
  );
}
