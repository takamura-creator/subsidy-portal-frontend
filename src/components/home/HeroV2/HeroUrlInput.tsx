"use client";

import { useState, type FormEvent } from "react";

interface HeroUrlInputProps {
  onSubmit: (url: string) => void;
  /** focus 時にデモ停止を親へ通知 */
  onFocus?: () => void;
}

/**
 * HeroUrlInput — URL入力フォーム + 緑CTA
 * Client Component。送信で LivePreview に URL を渡す。
 * C9: http/https 以外のURL（javascript: 等）を弾くガード付き。
 */
export default function HeroUrlInput({ onSubmit, onFocus: onFocusProp }: HeroUrlInputProps) {
  const [value, setValue] = useState("");
  const [urlError, setUrlError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    // C9: 危険スキーム遮断（XSS防止）
    const DANGEROUS = /^(javascript|data|vbscript|file|blob|about):/i;
    if (DANGEROUS.test(trimmed)) {
      setUrlError("このURLは使用できません");
      return;
    }
    // :// を含むが http/https 以外のスキーム（例: ftp:// など）も弾く
    const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+\-.]*):\/\//);
    if (schemeMatch && !["http", "https"].includes(schemeMatch[1].toLowerCase())) {
      setUrlError("http または https のURLを入力してください");
      return;
    }

    // スキームなし → https:// を自動前置
    const normalized =
      trimmed.startsWith("https://") || trimmed.startsWith("http://")
        ? trimmed
        : `https://${trimmed}`;

    // 最低限の妥当性: ドットを含まない裸の文字列は警告（厳しくしない）
    const withoutScheme = normalized.replace(/^https?:\/\//, "");
    if (!withoutScheme.includes(".")) {
      setUrlError("有効なドメイン名を入力してください（例: multik.jp）");
      return;
    }

    setUrlError("");
    onSubmit(normalized);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", maxWidth: 560 }}>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: 8,
          width: "100%",
        }}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (urlError) setUrlError("");
          }}
          placeholder="例: multik.jp"
          aria-label="会社ホームページURL"
          aria-describedby={urlError ? "url-error" : undefined}
          aria-invalid={!!urlError}
          style={{
            flex: 1,
            padding: "12px 16px",
            border: `1px solid ${urlError ? "var(--hc-error)" : "var(--hc-border)"}`,
            borderRadius: 8,
            fontSize: 15,
            fontFamily: "'Noto Sans JP', sans-serif",
            color: "var(--hc-text)",
            background: "var(--hc-white)",
            outline: "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = urlError ? "var(--hc-error)" : "var(--hc-primary)";
            e.target.style.boxShadow = "var(--hc-focus-ring)";
            onFocusProp?.();
          }}
          onBlur={(e) => {
            e.target.style.borderColor = urlError ? "var(--hc-error)" : "var(--hc-border)";
            e.target.style.boxShadow = "none";
          }}
        />
        <button
          type="submit"
          style={{
            padding: "12px 24px",
            background: "var(--hc-primary)",
            color: "var(--hc-white)",
            border: "2px solid var(--hc-primary)",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "'Noto Sans JP', sans-serif",
            cursor: "pointer",
            whiteSpace: "nowrap",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--hc-white)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--hc-primary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--hc-primary)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--hc-white)";
          }}
        >
          URLで無料診断する
        </button>
      </form>

      {/* C9: URLエラー表示 */}
      {urlError && (
        <p
          id="url-error"
          role="alert"
          style={{
            fontSize: 12,
            color: "var(--hc-error)",
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          {urlError}
        </p>
      )}
    </div>
  );
}
