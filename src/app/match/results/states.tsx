"use client";

import type React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { MATCH_TIMEOUT_MS } from "@/lib/api";

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

/** AI 診断の通常の所要（本番実測 26.8〜30.6 秒・2026-10-27）。進み具合の目安表示にだけ使う。 */
const TYPICAL_WAIT_SEC = 30;

/** 経過秒に応じた工程の文言（目安。実際の処理段階と同期しているわけではない） */
function waitingMessage(sec: number): string {
  if (sec < 5) return "条件に合う補助金を絞り込んでいます";
  if (sec < TYPICAL_WAIT_SEC - 5) return "AIが候補を比べて、おすすめ順を決めています";
  if (sec < TYPICAL_WAIT_SEC + 15) return "まもなく結果が出ます";
  return `混み合っています。もう少しお待ちください（最大${Math.round(MATCH_TIMEOUT_MS / 1000)}秒）`;
}

/**
 * 診断待ちの表示（2026-10-27）。AI 応答に約30秒かかるため、固定文言だけだと止まって見える。
 * 経過秒・工程の目安・目安バー（応答前は90%で止め、100%にはしない）で「進んでいる」ことを示す。
 */
export function LoadingState() {
  const [sec, setSec] = useState(0);
  useEffect(() => {
    const started = Date.now();
    const id = setInterval(() => setSec(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  const pct = Math.min(90, Math.round((sec / TYPICAL_WAIT_SEC) * 90));

  return (
    <div
      style={{ padding: "40px 24px", textAlign: "center", color: "var(--hc-text-muted)" }}
      aria-busy="true"
      data-testid="match-loading"
    >
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--hc-navy)", marginBottom: 6 }} aria-live="polite">
        {waitingMessage(sec)}
      </div>
      <div style={{ fontSize: 12, marginBottom: 14 }}>
        経過 {sec}秒 ／ 通常{TYPICAL_WAIT_SEC}秒ほどかかります。この画面のままお待ちください。
      </div>
      <div
        role="progressbar"
        aria-label="診断の進み具合（目安）"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        style={{
          maxWidth: 320,
          height: 6,
          margin: "0 auto",
          borderRadius: 9999,
          background: "var(--hc-border)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: "var(--hc-primary)",
            transition: "width 0.9s linear",
          }}
        />
      </div>
    </div>
  );
}
