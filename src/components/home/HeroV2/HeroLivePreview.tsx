"use client";

/**
 * HeroLivePreview — デモ/ライブ分岐ハブ
 *
 * mode="demo": HeroDemoTimeline（7.8秒/周 自動ループ）を表示
 * mode="live": url prop 駆動の実解析表示（idle→analyzing→done）
 *   - diagnoseResult が渡れば実データ表示（モック値は撤去済み）
 *   - fallback=true 時は「簡易診断（AI混雑）」を小さく表示
 * useReducedMotion 時: デモ起動せず done 静止1枚（P3）
 * 景表法ガード: 金額13px以下・mc-disclaimer 常時（P4）
 */

import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import TypeWriter from "@/components/motion/TypeWriter";
import HeroDemoTimeline from "./HeroDemoTimeline";
import { EASING, DURATION, STAGGER } from "@/lib/motion-tokens";
import { formatRate } from "@/lib/formatRate";
import type { DiagnoseResponse } from "@/lib/api";

type LivePhase = "idle" | "analyzing" | "done";

interface HeroLivePreviewProps {
  mode: "demo" | "live";
  url: string | null;
  diagnoseResult: DiagnoseResponse | null;
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

export default function HeroLivePreview({ mode, url, diagnoseResult }: HeroLivePreviewProps) {
  const prefersReduced = useReducedMotion();

  // livePhase は props から直接 derive（setState-in-effect を最小化）
  const livePhase: LivePhase =
    mode !== "live" || !url ? "idle"
    : diagnoseResult ? "done"
    : "analyzing";

  const [scanProgress, setScanProgress] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // scanProgress のみ interval で管理。livePhase は props 由来の derived 値。
  // setScanProgress はすべて interval/timeout コールバック内（非同期）から呼ぶことで
  // effect body 内での synchronous setState を回避する。
  useEffect(() => {
    if (progressRef.current) clearInterval(progressRef.current);

    if (livePhase === "analyzing") {
      const stepVal = 90 / (DURATION.livePreview * 1000 / 60);
      let first = true;
      progressRef.current = setInterval(() => {
        setScanProgress((p) => {
          if (first) { first = false; return 0; }
          return Math.min(p + stepVal, 90);
        });
      }, 60);
      return () => { if (progressRef.current) clearInterval(progressRef.current); };
    }

    if (livePhase === "done") {
      const t = setTimeout(() => setScanProgress(100), 0);
      return () => clearTimeout(t);
    }

    if (livePhase === "idle") {
      const t = setTimeout(() => setScanProgress(0), 0);
      return () => clearTimeout(t);
    }
  }, [livePhase]);

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
        {mode === "demo" && (
          <span style={{
            fontSize: 10, fontWeight: 700, color: "var(--hc-primary)",
            background: "color-mix(in srgb, var(--hc-primary) 10%, var(--hc-white))",
            border: "1px solid var(--hc-primary-line)",
            borderRadius: 4, padding: "1px 6px", flexShrink: 0,
            fontFamily: "'Sora', 'Noto Sans JP', sans-serif", letterSpacing: "0.06em",
          }}>
            DEMO
          </span>
        )}
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
                <p style={{ fontSize: 11, color: "var(--hc-text-muted)", margin: 0 }}>
                  完了見込み: 約10〜30秒（AI解析中）
                </p>
                {[80, 60, 90, 40].map((w, i) => (
                  <div key={i} className="skeleton" style={{ height: 14, width: `${w}%`, borderRadius: 4 }} />
                ))}
              </div>
            )}
            {livePhase === "done" && diagnoseResult && (
              <LiveDoneView result={diagnoseResult} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// --- ライブ完了: 実データ表示 ---

function LiveDoneView({ result }: { result: DiagnoseResponse }) {
  const { extracted, matches, estimate, fallback } = result;

  const industryText = [
    extracted.industry,
    extracted.employees != null ? `従業員 ${extracted.employees}名` : null,
    extracted.prefecture,
  ].filter(Boolean).join("・");

  const matchCount = matches.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* 企業情報 */}
      <LiveStep index={0}>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={OVERLINE_STYLE}>企業情報</span>
          {extracted.company_name && (
            <div style={{ fontSize: 12, color: "var(--hc-text-muted)" }}>
              {extracted.company_name}
            </div>
          )}
          <div style={{ fontSize: 13, color: "var(--hc-navy)", fontWeight: 600 }}>
            {industryText || "（業種情報取得中）"}
          </div>
        </div>
      </LiveStep>

      {/* マッチ補助金 */}
      <LiveStep index={1}>
        <div style={{ padding: "10px 14px",
          background: "color-mix(in srgb, var(--hc-primary) 8%, var(--hc-white))",
          border: "1px solid var(--hc-primary-line)", borderRadius: 8 }}>
          <span style={{ ...OVERLINE_STYLE, color: "var(--hc-primary)" }}>マッチした補助金</span>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--hc-primary)", marginTop: 4 }}>
            {matchCount > 0 ? (
              <TypeWriter text={`${matchCount}件 見つかりました`} speed={40} />
            ) : (
              <span style={{ fontSize: 13 }}>診断条件で詳しく探します</span>
            )}
          </div>
          {matchCount > 0 && (
            <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
              {matches.slice(0, 2).map((m) => (
                <div key={m.subsidy.id} style={{
                  fontSize: 11, color: "var(--hc-text)",
                  display: "flex", gap: 4, alignItems: "center",
                }}>
                  <span style={{
                    padding: "1px 5px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                    background: m.match_score === "高"
                      ? "color-mix(in srgb, var(--hc-primary) 15%, var(--hc-white))"
                      : "var(--hc-border)",
                    color: m.match_score === "高" ? "var(--hc-primary)" : "var(--hc-text-muted)",
                  }}>{m.match_score}</span>
                  <span>{m.subsidy.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </LiveStep>

      {/* 概算見積り */}
      {estimate.max_amount > 0 && (
        <LiveStep index={2}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={OVERLINE_STYLE}>概算見積り（目安）</span>
            <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--hc-navy)", fontFamily: "'Sora', 'Noto Sans JP', sans-serif" }}>
                上限額（目安）: ¥{estimate.max_amount.toLocaleString("ja-JP")}
              </span>
              <span style={{ fontSize: 11, color: "var(--hc-text-muted)" }}>
                {formatRate(Math.round(estimate.rate_min * 100), Math.round(estimate.rate_max * 100))} 補助
              </span>
            </div>
            {fallback && (
              <p style={{ fontSize: 10, color: "var(--hc-text-muted)", margin: 0 }}>
                ※ 簡易診断（AI混雑のためルールベース）
              </p>
            )}
            <p className="mc-disclaimer">
              ※制度・条件により異なります。出典：公式資料。診断は目安です。
            </p>
          </div>
        </LiveStep>
      )}
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

// reduced-motion 用デモ静止1枚（デモ時のみ使用）
function ReducedFallback() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={OVERLINE_STYLE}>企業情報</span>
        <div style={{ fontSize: 13, color: "var(--hc-navy)", fontWeight: 600 }}>URLを入力して診断</div>
      </div>
      <div style={{ padding: "10px 14px",
        background: "color-mix(in srgb, var(--hc-primary) 8%, var(--hc-white))",
        border: "1px solid var(--hc-primary-line)", borderRadius: 8 }}>
        <span style={{ ...OVERLINE_STYLE, color: "var(--hc-primary)" }}>マッチした補助金</span>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--hc-primary)", marginTop: 4 }}>
          AIが見つけてきます
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={OVERLINE_STYLE}>概算見積り</span>
        <p className="mc-disclaimer">
          ※制度・条件により異なります。診断は目安です。
        </p>
      </div>
    </div>
  );
}
