/**
 * HeroV2/index.tsx — Server Component（"use client" 禁止）
 *
 * 構造: 2カラムグリッド
 *   左: h1（3行・SSR即時=LCP）+ リード文 ← Server DOM（FadeIn不要）
 *   右: HeroLivePreview（自動デモ/ライブ）← Client
 *
 * HeroClientShell が2カラムgridを担当し、headingSlot に Server h1+リードを渡す。
 * これにより h1はServer ComponentのままSSR出力され、LCPを維持する。
 */

import HeroClientShell from "./HeroClientShell";

const HEADING_SLOT = (
  <div>
    {/* Display h1 — 3行明示スタック。各行 white-space:nowrap で折返し禁止 */}
    <h1
      style={{
        margin: "0 0 20px",
        display: "flex",
        flexDirection: "column",
        gap: "0.1em",
      }}
    >
      <span
        style={{
          fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
          fontWeight: 700,
          fontSize: "clamp(28px, 4vw, 56px)",
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
          color: "var(--hc-text-muted)",
          whiteSpace: "nowrap",
        }}
      >
        URLを入れるだけ。
      </span>
      <span
        style={{
          fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
          fontWeight: 700,
          fontSize: "clamp(28px, 4vw, 56px)",
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
          color: "var(--hc-navy)",
          whiteSpace: "nowrap",
        }}
      >
        使える補助金を、
      </span>
      <span
        style={{
          fontFamily: "'Sora', 'Noto Sans JP', sans-serif",
          fontWeight: 700,
          fontSize: "clamp(28px, 4vw, 56px)",
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
          color: "var(--hc-primary)",
          whiteSpace: "nowrap",
        }}
      >
        AIが見つけてくる。
      </span>
    </h1>

    <p
      style={{
        fontSize: 16,
        color: "var(--hc-text-muted)",
        lineHeight: 1.7,
        margin: 0,
        fontFamily: "'Noto Sans JP', sans-serif",
      }}
    >
      会社サイトのURLを入力するだけ。業種・地域から使える可能性のある補助金を自動で絞り込み。防犯カメラの申請書ドラフトと概算見積りまで、その場で。
    </p>
  </div>
);

export default function HeroV2() {
  return (
    <section className="hc-hero" aria-label="ヒーロー">
      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* 2カラムグリッド: 左=h1+フォーム / 右=プレビュー */}
        <HeroClientShell headingSlot={HEADING_SLOT} />
      </div>
    </section>
  );
}
