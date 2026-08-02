"use client";

import { useState, type AnimationEvent, type FormEvent } from "react";

interface HeroUrlInputProps {
  /** 戻り値 true = A（導入シーケンス）。false = R（リトライ）で導入演出は再生しない */
  onSubmit: (url: string) => boolean;
  /** focus 時にデモ停止を親へ通知 */
  onFocus?: () => void;
  /** 解析中: disabled / aria-busy / readOnly / 入力欄ロック（台本 A2・A5） */
  busy: boolean;
  /** CTA文言（§5.1 文言マスター・親のタイムラインが決定） */
  label: string;
  /** 入力欄の走査光（A6・解析中のみ 1.600s 周期で反復） */
  scanning: boolean;
}

/**
 * HeroUrlInput — URL入力フォーム + 緑CTA
 * Client Component。送信で親の状態機械に URL を渡す。
 * C9: http/https 以外のURL（javascript: 等）を弾くガード付き。
 *
 * 台本『診断卓』A1/A2/A3/A4/A5/A6:
 *   押し込み(80ms)→戻り(120ms) / ラベル交代 + 12px リングスピナー /
 *   発火リング 1 回のみ / 入力欄ロック（値は消さない）/ 走査光。
 * サブ 100ms のオフセットは CSS の animation-delay・transition-delay で保持する。
 */
export default function HeroUrlInput({
  onSubmit,
  onFocus: onFocusProp,
  busy,
  label,
  scanning,
}: HeroUrlInputProps) {
  const [value, setValue] = useState("");
  const [urlError, setUrlError] = useState("");
  const [pressed, setPressed] = useState(false);
  const [ripple, setRipple] = useState(0);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
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
    // A1/A3 押し込み→戻り・A4 発火リングは導入シーケンス（A）専用。
    // リトライ（R）は R1-R6 に押し込み/リングが無く、デモ HTML の beginRetry も再生しない。
    if (onSubmit(normalized)) {
      setPressed(true);
      setRipple((n) => n + 1);
    }
  }

  // 発火リング（子）の animationend が冒泡してくるため自身の発火のみ拾う
  function handleButtonAnimationEnd(e: AnimationEvent<HTMLButtonElement>) {
    if (e.target !== e.currentTarget) return;
    setPressed(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", maxWidth: 560 }}>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, width: "100%" }}>
        <div className={`hc-scan-field${scanning ? " is-scanning" : ""}`}>
          <input
            type="text"
            value={value}
            readOnly={busy}
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
              width: "100%",
              padding: busy ? "11px 15px" : "12px 16px",
              border: busy
                ? "2px solid var(--hc-primary)"
                : `1px solid ${urlError ? "var(--hc-error)" : "var(--hc-border)"}`,
              borderRadius: 8,
              fontSize: 15,
              fontFamily: "'Noto Sans JP', sans-serif",
              color: "var(--hc-text)",
              background: "var(--hc-white)",
              outline: "none",
              // A5: 太さ・詰めは t=0.060 で即時に切替（色のみ 200ms でイージング）
              transition: "border-width 0.001s, padding 0.001s, border-color 0.2s",
              transitionDelay: busy ? "60ms" : "0ms",
            }}
            onFocus={(e) => {
              if (busy) return;
              e.target.style.borderColor = urlError ? "var(--hc-error)" : "var(--hc-primary)";
              onFocusProp?.();
            }}
            onBlur={(e) => {
              if (busy) return;
              e.target.style.borderColor = urlError ? "var(--hc-error)" : "var(--hc-border)";
            }}
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          aria-busy={busy || undefined}
          className={pressed ? "hc-cta-press" : undefined}
          onAnimationEnd={handleButtonAnimationEnd}
          style={{
            position: "relative",
            padding: "12px 24px",
            background: "var(--hc-primary)",
            color: "var(--hc-white)",
            border: "2px solid var(--hc-primary)",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "'Noto Sans JP', sans-serif",
            cursor: busy ? "default" : "pointer",
            whiteSpace: "nowrap",
            transition: "background 0.2s, color 0.2s",
          }}
          onMouseEnter={(e) => {
            if (busy) return;
            (e.currentTarget as HTMLButtonElement).style.background = "var(--hc-white)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--hc-primary)";
          }}
          onMouseLeave={(e) => {
            if (busy) return;
            (e.currentTarget as HTMLButtonElement).style.background = "var(--hc-primary)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--hc-white)";
          }}
        >
          {busy && <span className="hc-cta-spinner" aria-hidden="true" />}
          {label}
          {ripple > 0 && (
            <span
              key={ripple}
              className="hc-ripple-ring"
              aria-hidden="true"
              onAnimationEnd={() => setRipple(0)}
            />
          )}
        </button>
      </form>

      {/* C9: URLエラー表示 */}
      {urlError && (
        <p
          id="url-error"
          role="alert"
          style={{ fontSize: 12, color: "var(--hc-error)", margin: 0, lineHeight: 1.5 }}
        >
          {urlError}
        </p>
      )}
    </div>
  );
}
