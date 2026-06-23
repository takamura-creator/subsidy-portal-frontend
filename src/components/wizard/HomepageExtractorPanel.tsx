"use client";

import { useState } from "react";
import { authFetch, ApiError } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface ExtractionResponse {
  extracted_fields: Record<string, string>;
  fallback: boolean;
}

interface Props {
  websiteUrl: string | undefined;
  subsidyId: string;
  onExtracted: (fields: Record<string, string>, fallback: boolean) => void;
}

export default function HomepageExtractorPanel({
  websiteUrl,
  subsidyId,
  onExtracted,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [lastResult, setLastResult] = useState<{
    count: number;
    fallback: boolean;
    fields: Record<string, string>;
  } | null>(null);

  const hasUrl = !!websiteUrl;

  async function handleExtract() {
    if (!websiteUrl) return;
    setLoading(true);
    setError("");
    setLastResult(null);

    try {
      const res = await authFetch<ExtractionResponse>(
        `${API_BASE}/api/extractions/homepage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: websiteUrl, subsidy_id: subsidyId }),
        }
      );
      const count = Object.keys(res.extracted_fields).length;
      setLastResult({ count, fallback: res.fallback, fields: res.extracted_fields });
      onExtracted(res.extracted_fields, res.fallback);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 408
            ? "タイムアウトしました。ホームページが応答しているか確認してください。"
            : `自動取得に失敗しました（${err.message}）。手動で入力してください。`
        );
      } else {
        setError("自動取得に失敗しました。手動で入力してください。");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      className="border border-border rounded-[10px] p-5 bg-[var(--hc-bg,#f7f9fc)]"
      aria-labelledby="extractor-heading"
    >
      <div className="flex items-start gap-3 mb-4">
        <span
          className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm"
          aria-hidden="true"
        >
          🌐
        </span>
        <div>
          <h3
            id="extractor-heading"
            className="text-[14px] font-bold text-navy"
            style={{ fontFamily: "'Sora', 'Noto Sans JP', sans-serif" }}
          >
            ホームページから自動取得
          </h3>
          <p className="text-[12px] text-text-muted mt-0.5 leading-relaxed">
            登録済みのURLから会社情報を自動取得してフォームに反映します。
            取得後も手動で修正できます。
          </p>
        </div>
      </div>

      {/* URL表示 */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div
          className="flex-1 min-w-0 border border-border rounded-[8px] px-3 py-2 bg-white text-[13px] text-text-muted truncate"
          aria-label="取得対象URL"
        >
          {hasUrl ? (
            <span className="text-navy font-medium">{websiteUrl}</span>
          ) : (
            <span className="italic">URLが設定されていません（Step 1 で入力してください）</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleExtract}
          disabled={!hasUrl || loading}
          aria-busy={loading}
          className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-[8px] bg-primary text-white text-[13px] font-semibold hover:bg-[var(--hc-primary-hover)] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Spinner />
              取得中…
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M7 1a6 6 0 1 1-4.243 1.757"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path d="M1 5V1h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              自動取得を開始
            </>
          )}
        </button>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div role="status" aria-label="情報を取得中です" className="space-y-2 mb-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-4 rounded bg-gray-200 animate-pulse"
              style={{ width: `${60 + i * 10}%` }}
            />
          ))}
        </div>
      )}

      {/* Success result */}
      {lastResult && !loading && (
        <div
          className="rounded-[8px] border border-green-200 bg-green-50 p-3"
          role="status"
          aria-live="polite"
        >
          <p className="text-[12px] font-semibold text-green-700 mb-1">
            ✓ {lastResult.count} 件の項目を自動取得しました
          </p>
          {lastResult.fallback && (
            <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-1">
              ⚠ 一部の情報を取得できませんでした。フォームで手動入力・修正してください。
            </p>
          )}
          <ul className="mt-2 space-y-0.5">
            {Object.entries(lastResult.fields).map(([k, v]) => (
              <li key={k} className="text-[11px] text-green-800 flex gap-2">
                <span className="font-medium">{k}:</span>
                <span className="truncate text-green-700">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div
          className="rounded-[8px] border border-red-200 bg-red-50 p-3 text-[12px] text-red-700"
          role="alert"
          aria-live="assertive"
        >
          {error}
        </div>
      )}
    </section>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.8" strokeDasharray="22 10" />
    </svg>
  );
}
