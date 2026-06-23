"use client";

import type React from "react";
import Link from "next/link";

export const SCORE_STYLES: Record<string, React.CSSProperties> = {
  高: {
    background: "var(--hc-primary-soft)",
    color: "var(--hc-success)",
    border: "2px solid var(--hc-success)",
  },
  中: {
    background: "var(--hc-text-subtle)",
    color: "var(--hc-text-muted)",
    border: "2px solid var(--hc-border)",
  },
  低: {
    background: "var(--hc-text-subtle)",
    color: "var(--hc-text-muted)",
    border: "2px solid var(--hc-border)",
  },
};

export function parseEmployees(raw: string): number {
  const m = raw.match(/\d+/);
  if (!m) return 10;
  const n = parseInt(m[0], 10);
  // "6〜20名" → 上限側を使用。"21〜50名" → 50。範囲不明なら数値そのまま
  const m2 = raw.match(/\d+[^〜]*〜[^〜]*(\d+)/);
  if (m2) return parseInt(m2[1], 10);
  return n;
}

export function EmptyState() {
  return (
    <div
      style={{
        padding: "40px 24px",
        textAlign: "center",
        background: "var(--hc-card-bg)",
        border: "1px solid var(--hc-border)",
        borderRadius: 10,
      }}
    >
      <p
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: "var(--hc-navy)",
          marginBottom: 8,
        }}
      >
        条件に合う補助金が見つかりませんでした
      </p>
      <p style={{ fontSize: 13, color: "var(--hc-text-muted)", marginBottom: 16 }}>
        入力条件を変えて再度お試しください。
      </p>
      <Link
        href="/match"
        className="btn-primary"
        style={{ padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}
      >
        診断をやり直す
      </Link>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: "40px 24px",
        textAlign: "center",
        background: "var(--hc-card-bg)",
        border: "1px solid var(--hc-border)",
        borderRadius: 10,
      }}
      role="alert"
    >
      <p style={{ fontSize: 15, fontWeight: 600, color: "var(--hc-navy)", marginBottom: 8 }}>
        結果を取得できませんでした
      </p>
      <p style={{ fontSize: 13, color: "var(--hc-text-muted)", marginBottom: 16 }}>
        {message}
      </p>
      <Link
        href="/match"
        className="btn-primary"
        style={{ padding: "8px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}
      >
        診断をやり直す
      </Link>
    </div>
  );
}

export function LoadingState() {
  return (
    <div
      style={{ padding: "40px 24px", textAlign: "center", color: "var(--hc-text-muted)" }}
      aria-live="polite"
      aria-busy="true"
    >
      <div style={{ fontSize: 14 }}>診断結果を取得中です...</div>
    </div>
  );
}
