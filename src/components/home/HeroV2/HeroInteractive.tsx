"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import HeroUrlInput from "./HeroUrlInput";
import HeroLivePreview from "./HeroLivePreview";

/**
 * HeroInteractive — URL状態 + デモ/ライブ mode 管理。
 * mode="demo": マウント時に自動デモループ（HeroLivePreview内で起動）。
 * mode="live": ユーザー focus 時にデモを停止（url は渡さない）。
 * FIX-1: 送信時は /match ウィザードへ遷移。submittedUrl は除去し
 *         live done への到達経路（モック ¥740,000 表示）を完全遮断。
 * grid は CSS クラス .hero-v2-grid（globals.css）で定義。
 */
export default function HeroInteractive() {
  const router = useRouter();
  const [mode, setMode] = useState<"demo" | "live">("demo");

  const handleFocus = useCallback(() => {
    setMode("live");
  }, []);

  const handleSubmit = useCallback(() => {
    router.push("/match");
  }, [router]);

  return (
    <div className="hero-v2-grid">
      {/* 左: フォーム */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <HeroUrlInput
          onSubmit={handleSubmit}
          onFocus={handleFocus}
        />
        <p style={{ fontSize: 12, color: "var(--hc-text-muted)", margin: 0 }}>
          登録不要・無料。数問の質問で、あなたに合う補助金をご案内します。
        </p>
      </div>

      {/* 右: LivePreview（デモ表示 — 送信前のイメージ。url=null で done到達不可） */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <HeroLivePreview mode={mode} url={null} />
      </div>
    </div>
  );
}
