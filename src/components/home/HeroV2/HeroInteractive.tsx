"use client";

import { useState, useCallback } from "react";
import HeroUrlInput from "./HeroUrlInput";
import HeroLivePreview from "./HeroLivePreview";

/**
 * HeroInteractive — URL状態 + デモ/ライブ mode 管理。
 * mode="demo": マウント時に自動デモループ（HeroLivePreview内で起動）。
 * mode="live": ユーザー focus/送信で即切替・デモへは自動復帰しない。
 * grid は CSS クラス .hero-v2-grid（globals.css）で定義。
 */
export default function HeroInteractive() {
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
      {/* 左: フォーム */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <HeroUrlInput
          onSubmit={handleSubmit}
          onFocus={handleFocus}
        />
        <p style={{ fontSize: 12, color: "var(--hc-text-muted)", margin: 0 }}>
          登録不要・無料。URLを入れるだけで診断が始まります。
        </p>
      </div>

      {/* 右: LivePreview */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <HeroLivePreview mode={mode} url={submittedUrl} />
      </div>
    </div>
  );
}
