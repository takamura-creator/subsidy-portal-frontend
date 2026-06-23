"use client";

import { useState, useCallback, type ReactNode } from "react";
import HeroUrlInput from "./HeroUrlInput";
import HeroLivePreview from "./HeroLivePreview";

interface HeroClientShellProps {
  /** Server Component（h1+リード）を左カラムに差し込む */
  headingSlot: ReactNode;
}

/**
 * HeroClientShell — 2カラムグリッドのClient境界ルート
 *
 * 左カラム: headingSlot (Server SSR済みh1+リード) + URL入力フォーム + 補足テキスト
 * 右カラム: HeroLivePreview（デモ/ライブ）
 *
 * mode="demo": マウント時に自動デモループ。
 * mode="live": URL入力フォーカスで即切替。デモへの自動復帰なし。
 */
export default function HeroClientShell({ headingSlot }: HeroClientShellProps) {
  const [mode, setMode] = useState<"demo" | "live">("demo");
  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null);

  const handleFocus = useCallback(() => {
    setMode("live");
  }, []);

  const handleSubmit = useCallback((url: string) => {
    setMode("live");
    setSubmittedUrl(url);
  }, []);

  return (
    <div className="hero-v2-grid">
      {/* 左カラム: SSR済みh1+リード + フォーム */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          justifyContent: "center",
        }}
      >
        {/* Server側のh1+リードをここに展開（LCP SSR即時維持） */}
        {headingSlot}

        {/* URL入力フォーム */}
        <HeroUrlInput onSubmit={handleSubmit} onFocus={handleFocus} />

        {/* 補足テキスト */}
        <p
          style={{
            fontSize: 12,
            color: "var(--hc-text-muted)",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          登録不要・無料。URLを入れるだけで診断が始まります。
        </p>
      </div>

      {/* 右カラム: LivePreview — 上揃え */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}>
        <HeroLivePreview mode={mode} url={submittedUrl} />
      </div>
    </div>
  );
}
