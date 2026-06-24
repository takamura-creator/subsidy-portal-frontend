"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import HeroUrlInput from "./HeroUrlInput";
import HeroLivePreview from "./HeroLivePreview";
import { diagnosePublic, DiagnoseResponse, ApiError } from "@/lib/api";

/**
 * HeroInteractive — URL 状態 + デモ/ライブ mode 管理。
 * mode="demo": マウント時に自動デモループ（HeroLivePreview内で起動）。
 * mode="live": ユーザー focus でデモ停止。
 * 送信時: diagnosePublic(url) を呼び実データを HeroLivePreview に渡す。
 * エラー/429: /match ウィザードへの導線を提示。
 */
export default function HeroInteractive() {
  const router = useRouter();
  const [mode, setMode] = useState<"demo" | "live">("demo");
  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null);
  const [diagnoseResult, setDiagnoseResult] = useState<DiagnoseResponse | null>(null);
  const [diagnoseError, setDiagnoseError] = useState<{ status: number; message: string } | null>(null);

  const handleFocus = useCallback(() => {
    setMode("live");
  }, []);

  const handleSubmit = useCallback(async (url: string) => {
    setMode("live");
    setSubmittedUrl(url);
    setDiagnoseResult(null);
    setDiagnoseError(null);

    try {
      const result = await diagnosePublic(url);
      setDiagnoseResult(result);
    } catch (err) {
      if (err instanceof ApiError) {
        setDiagnoseError({ status: err.status, message: err.message });
      } else {
        setDiagnoseError({ status: 0, message: "診断中にエラーが発生しました" });
      }
    }
  }, []);

  const handleRetry = useCallback(() => {
    setSubmittedUrl(null);
    setDiagnoseResult(null);
    setDiagnoseError(null);
    setMode("demo");
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
          登録不要・無料。URLを入れるだけで、使える補助金をAIが見つけます。
        </p>

        {/* エラー/429 時の導線（C8: 制御と自由） */}
        {diagnoseError && (
          <div style={{
            padding: "12px 16px",
            border: "1px solid var(--hc-border)",
            borderRadius: 8,
            background: "color-mix(in srgb, var(--hc-error) 6%, var(--hc-white))",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}>
            <p style={{ fontSize: 13, color: "var(--hc-text)", margin: 0 }}>
              {diagnoseError.status === 429
                ? "アクセスが集中しています。しばらくお待ちください。"
                : "診断の取得に失敗しました。手入力での診断もご利用いただけます。"}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={() => router.push("/match")}
                style={{
                  fontSize: 12, padding: "6px 14px",
                  background: "var(--hc-primary)", color: "var(--hc-white)",
                  border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600,
                }}
              >
                詳しく診断する（手入力）
              </button>
              <button
                onClick={handleRetry}
                style={{
                  fontSize: 12, padding: "6px 14px",
                  background: "transparent", color: "var(--hc-text-muted)",
                  border: "1px solid var(--hc-border)", borderRadius: 6, cursor: "pointer",
                }}
              >
                もう一度試す
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 右: LivePreview */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <HeroLivePreview
          mode={mode}
          url={submittedUrl}
          diagnoseResult={diagnoseResult}
        />
      </div>
    </div>
  );
}
