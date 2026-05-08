"use client";

/**
 * AIDraftBlock — AI下書き共通表示部品
 *
 * 重要要件（Groot UI仕様 08）:
 *  - 紫枠 #8B5CF6 / 背景 #F3F0FF / 「✨ AIドラフト（要校閲）」バッジ
 *  - useEffect での自動API呼出は絶対禁止（トリガーは onClick のみ）
 *  - 数値・%・金額が混入した出力はサニタイズしてユーザー警告
 *  - 二重押下防止のローディング状態必須
 */

import { useRef, useState } from "react";
import {
  postGenerateSection,
  type AISectionType,
  type GenerateSectionResponse,
} from "@/lib/api";

export interface AIDraftBlockProps {
  sectionType: AISectionType;
  structuredData: Record<string, unknown>;
  triggerLabel?: string;
  disabled?: boolean;
  onGenerated?: (draft: { text: string; refs: string[] }) => void;
  /** analytics 計測ラベル（例: "roi_simulator"） */
  analyticsKey?: string;
}

// 数値混入検出用パターン（円・万円・%・採択率の数値混入を検出）
const NUMERIC_LEAK_PATTERN = /\d+\s*(?:%|％|円|万円|千円|億円)/;

function logEvent(eventName: string, payload?: Record<string, unknown>) {
  if (typeof window !== "undefined") {
    console.debug("[analytics]", eventName, payload ?? {});
  }
}

export default function AIDraftBlock({
  sectionType,
  structuredData,
  triggerLabel = "✨ AIで下書き生成",
  disabled = false,
  onGenerated,
  analyticsKey = sectionType,
}: AIDraftBlockProps) {
  const [state, setState] = useState<"idle" | "loading" | "displaying" | "editing" | "error">("idle");
  const [response, setResponse] = useState<GenerateSectionResponse | null>(null);
  const [editedText, setEditedText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [hasNumericLeak, setHasNumericLeak] = useState(false);
  // 二重押下防止用ロック（state更新の非同期性に依存しない）
  const lockRef = useRef<boolean>(false);

  // ⚠ 明示トリガー（onClick）から呼ぶ。useEffect で自動呼出してはならない。
  async function handleGenerate() {
    if (lockRef.current || state === "loading") return;
    lockRef.current = true;
    setState("loading");
    setError(null);
    logEvent("ai_draft_generate_start", { key: analyticsKey, sectionType });
    try {
      const res = await postGenerateSection({
        section_type: sectionType,
        structured_data: structuredData,
      });
      // 数値混入チェック（混入時は警告表示するが、テキスト自体は表示する）
      const leak = NUMERIC_LEAK_PATTERN.test(res.draft_text);
      setHasNumericLeak(leak);
      if (leak) {
        console.warn("[AIDraftBlock] numeric content leaked into draft", {
          sectionType,
          requestId: res.request_id,
        });
      }
      setResponse(res);
      setEditedText(res.draft_text);
      setState("displaying");
      onGenerated?.({ text: res.draft_text, refs: res.source_references });
      logEvent("ai_draft_generate_success", {
        key: analyticsKey,
        requestId: res.request_id,
        leak,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI下書き生成に失敗しました";
      setError(msg);
      setState("error");
      logEvent("ai_draft_generate_error", { key: analyticsKey, message: msg });
    } finally {
      lockRef.current = false;
    }
  }

  function handleCopy() {
    if (typeof navigator === "undefined") return;
    navigator.clipboard?.writeText(editedText);
    logEvent("ai_draft_copy", { key: analyticsKey });
  }

  function handleDiscard() {
    setResponse(null);
    setEditedText("");
    setError(null);
    setHasNumericLeak(false);
    setState("idle");
    logEvent("ai_draft_discard", { key: analyticsKey });
  }

  // ====== 描画 ======
  if (state === "idle" || state === "error") {
    return (
      <div style={{ marginTop: 16 }}>
        <button
          type="button"
          // ⚠ AI呼出はこの onClick からのみ起動する（明示トリガー）
          onClick={handleGenerate}
          disabled={disabled}
          style={{
            background: "#8B5CF6",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 16px",
            fontWeight: 700,
            fontSize: 13,
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
          }}
          aria-label={triggerLabel}
        >
          {triggerLabel}
        </button>
        {state === "error" && error && (
          <div
            role="alert"
            style={{
              marginTop: 8,
              padding: 8,
              fontSize: 12,
              color: "#B91C1C",
              background: "#FEE2E2",
              border: "1px solid #FCA5A5",
              borderRadius: 6,
            }}
          >
            {error}（再試行してください）
          </div>
        )}
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div
        aria-busy="true"
        aria-live="polite"
        style={{
          marginTop: 16,
          padding: 16,
          background: "#F3F0FF",
          border: "1px solid #8B5CF6",
          borderRadius: 8,
          fontSize: 13,
          color: "#5B21B6",
        }}
      >
        ✨ AI下書きを生成中... (10〜30秒)
      </div>
    );
  }

  // displaying / editing
  return (
    <section
      // 紫枠 #8B5CF6 + 背景 #F3F0FF（決定論結果との視覚区別）
      aria-live="polite"
      style={{
        marginTop: 16,
        padding: 16,
        background: "#F3F0FF",
        border: "1px solid #8B5CF6",
        borderRadius: 8,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
          flexWrap: "wrap",
        }}
      >
        <span
          // テキストバッジ（色だけに依存しないA11y対応）
          style={{
            background: "#8B5CF6",
            color: "#fff",
            padding: "2px 8px",
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          ✨ AIドラフト（要校閲）
        </span>
        <span style={{ fontSize: 10, color: "#6B7280" }}>
          {response?.model_version} / {response?.generated_at?.slice(0, 16)}
        </span>
        <span style={{ fontSize: 10, color: "#9CA3AF", marginLeft: "auto" }}>
          req: {response?.request_id?.slice(0, 8)}
        </span>
      </header>

      {hasNumericLeak && (
        <div
          role="alert"
          style={{
            marginBottom: 8,
            padding: 6,
            background: "#FEF3C7",
            border: "1px solid #F59E0B",
            borderRadius: 4,
            fontSize: 11,
            color: "#92400E",
          }}
        >
          ⚠ 数値・金額・%が文章に含まれています。決定論結果カードの数値を正としてください。
        </div>
      )}

      {state === "editing" ? (
        <textarea
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          rows={8}
          style={{
            width: "100%",
            padding: 8,
            fontSize: 13,
            lineHeight: 1.7,
            border: "1px solid #C4B5FD",
            borderRadius: 6,
            background: "#fff",
            color: "#1F2937",
            fontFamily: "inherit",
          }}
        />
      ) : (
        <p
          style={{
            margin: 0,
            fontSize: 13,
            lineHeight: 1.8,
            color: "#1F2937",
            whiteSpace: "pre-wrap",
          }}
        >
          {editedText}
        </p>
      )}

      {response?.source_references && response.source_references.length > 0 && (
        <p style={{ fontSize: 10, color: "#6B7280", marginTop: 8 }}>
          出典: {response.source_references.join(", ")}
        </p>
      )}

      <hr style={{ border: 0, borderTop: "1px dashed #C4B5FD", margin: "10px 0" }} />
      <p style={{ fontSize: 11, color: "#6B21A8", margin: "0 0 8px" }}>
        ⚠ これは下書きです。最終文責はユーザーにあります。
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" onClick={handleCopy} style={btnSecondary}>
          📋 コピー
        </button>
        <button
          type="button"
          onClick={() => setState(state === "editing" ? "displaying" : "editing")}
          style={btnSecondary}
        >
          {state === "editing" ? "✓ 完了" : "✏ 編集"}
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={state === "editing"}
          style={btnSecondary}
        >
          🔄 再生成
        </button>
        <button type="button" onClick={handleDiscard} style={btnSecondary}>
          ✕ 破棄
        </button>
      </div>
    </section>
  );
}

const btnSecondary: React.CSSProperties = {
  background: "#fff",
  color: "#6B21A8",
  border: "1px solid #8B5CF6",
  borderRadius: 6,
  padding: "6px 10px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};
