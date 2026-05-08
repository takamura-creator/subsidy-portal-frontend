"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useDraft } from "@/lib/useDraft";
import { useScore } from "@/lib/useScore";
import { exportDraftBlob } from "@/lib/api";
import type { CompanyInfo, SubsidySelection } from "./types";
import type { DraftChapter } from "@/lib/api";
import DrillDownChat from "./DrillDownChat";

interface CollectedInfo {
  extracted?: Record<string, string>;
  manual?: Record<string, string>;
}

interface Props {
  company: Partial<CompanyInfo>;
  subsidy?: SubsidySelection;
  collectedInfo?: CollectedInfo;
  applicationId?: string;
  draftId?: string;
  hpExtracted?: Record<string, string>;
  qaAnswers?: Record<string, string>;
  onBack: () => void;
  onNext: () => void;
}

function renderHighlighted(content: string): ReactNode[] {
  const parts = content.split(/(==[^=]+==)/g);
  return parts.map((part, i) => {
    const match = part.match(/^==([^=]+)==$/);
    if (match) {
      return (
        <mark key={i} className="bg-amber-100 text-amber-900 px-0.5 rounded">
          {match[1]}
        </mark>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function Step8Draft({
  company,
  subsidy,
  collectedInfo,
  applicationId,
  draftId: initialDraftId,
  hpExtracted,
  qaAnswers,
  onBack,
  onNext,
}: Props) {
  const { draft, loading, error, generate, load, updateChapter } = useDraft();
  const { score, loading: scoreLoading, evaluate } = useScore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showDrillDown, setShowDrillDown] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const appId = applicationId ?? "draft-preview";
  const subsidyId = subsidy?.id ?? "jizokuka-2026";
  const draftId = draft?.draft_id ?? initialDraftId;

  useEffect(() => {
    if (draft || loading) return;
    if (initialDraftId) {
      load(appId, initialDraftId);
    } else {
      generate(appId, {
        subsidy_id: subsidyId,
        subsidy_name: subsidy?.name ?? "",
        company_name: company.companyName ?? "",
        industry: company.industry ?? "",
        company_info: hpExtracted ?? collectedInfo?.manual as Record<string, string> ?? {},
        collected_answers: qaAnswers ?? collectedInfo?.extracted as Record<string, string> ?? {},
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasRequiresInfo = draft?.chapters.some(ch => ch.requires_info) ?? false;

  function startEdit(ch: DraftChapter) {
    setEditingId(ch.chapter_id);
    setEditContent(ch.content);
  }

  function saveEdit(chapterId: string) {
    updateChapter(chapterId, editContent, appId, draftId);
    setEditingId(null);
  }

  async function handleExport(format: "pdf" | "docx") {
    if (!draftId) return;
    setExporting(true);
    setExportError(null);
    try {
      const blob = await exportDraftBlob(appId, draftId, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `事業計画書_${subsidyId}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "出力に失敗しました。再度お試しください。");
    } finally {
      setExporting(false);
    }
  }

  function handleDrillDownComplete(answers: Array<{ question: string; answer: string }>) {
    setShowDrillDown(false);
    generate(appId, {
      subsidy_id: subsidyId,
      subsidy_name: subsidy?.name ?? "",
      company_name: company.companyName ?? "",
      industry: company.industry ?? "",
      company_info: hpExtracted ?? collectedInfo?.manual as Record<string, string> ?? {},
      collected_answers: qaAnswers ?? collectedInfo?.extracted as Record<string, string> ?? {},
      drill_down_answers: answers,
    });
  }

  if (showDrillDown) {
    return (
      <DrillDownChat
        chapters={draft?.chapters ?? []}
        applicationId={appId}
        onComplete={handleDrillDownComplete}
        onSkip={() => setShowDrillDown(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-navy">事業計画書ドラフト</h2>
        <div className="flex items-center gap-3">
          {draftId && (
            <span className="text-xs text-text-muted">
              ID: {draftId.slice(0, 8)}
            </span>
          )}
        </div>
      </div>

      {/* ハイライト凡例 */}
      {draft && !loading && (
        <div className="flex items-center gap-3 text-[12px] bg-amber-50 border border-amber-200 rounded-[8px] px-3 py-2">
          <mark className="bg-amber-100 text-amber-900 px-1 rounded">サンプル値</mark>
          <span className="text-amber-800">= AIが推定した値です。クリックして実際の数値に修正してください。</span>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <span className="ml-3 text-sm text-text-muted">ドラフト生成中...</span>
        </div>
      )}

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
          {error}（モックデータを表示中）
        </div>
      )}

      {draft && !loading && (
        <div className="space-y-4">
          {draft.chapters.map((ch) => (
            <div
              key={ch.chapter_id}
              className={`border rounded-lg p-4 transition-colors ${
                ch.requires_info
                  ? "border-amber-300 bg-amber-50/50"
                  : ch.has_ng_word
                    ? "border-red-300 bg-red-50/50"
                    : "border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-navy">{ch.title}</h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-text-muted">
                    v{ch.version_num} / {ch.generated_by === "ai" ? "AI" : "手動"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {ch.requires_info && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                      要修正
                    </span>
                  )}
                  {ch.has_ng_word && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                      NGワード検出
                    </span>
                  )}
                </div>
              </div>

              {editingId === ch.chapter_id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full h-40 p-3 border border-border rounded text-sm resize-y focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-mono"
                    placeholder="==値== で囲むとハイライト表示されます"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(ch.chapter_id)}
                      className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 text-xs bg-gray-100 text-text-muted rounded hover:bg-gray-200"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {renderHighlighted(ch.content)}
                  </p>
                  <button
                    onClick={() => startEdit(ch)}
                    className="mt-2 text-xs text-primary hover:underline"
                  >
                    編集
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* スコア表示 */}
      {score && (
        <div className="border border-border rounded-lg p-4">
          <h3 className="font-semibold text-sm text-navy mb-3">採択スコア</h3>
          <div className="space-y-2">
            {score.score_breakdown.map((item) => (
              <div key={item.criterion} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{item.criterion}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(item.score / item.max) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-text-muted w-12 text-right">
                    {item.score}/{item.max}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-text-muted">
            信頼度: {score.confidence_level}
          </p>
        </div>
      )}

      {exportError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
          {exportError}
        </div>
      )}

      {/* ボタン群 */}
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-[8px] border border-border bg-white text-text font-medium hover:bg-gray-50 transition"
        >
          戻る
        </button>
        {hasRequiresInfo && (
          <button
            type="button"
            onClick={() => setShowDrillDown(true)}
            className="px-5 py-3 rounded-[8px] bg-amber-500 text-white font-medium hover:bg-amber-600 transition"
          >
            深掘り質問へ
          </button>
        )}
        <button
          type="button"
          onClick={() => evaluate(appId, subsidyId)}
          disabled={scoreLoading}
          className="px-5 py-3 rounded-[8px] border border-primary text-primary font-medium hover:bg-primary/5 transition disabled:opacity-50"
        >
          {scoreLoading ? "確認中..." : "スコア確認"}
        </button>
        <button
          type="button"
          onClick={() => handleExport("pdf")}
          disabled={exporting || !draftId}
          className="px-5 py-3 rounded-[8px] border border-primary text-primary font-medium hover:bg-primary/5 transition disabled:opacity-50"
        >
          {exporting ? "出力中..." : "PDF出力"}
        </button>
        <button
          type="button"
          onClick={() => handleExport("docx")}
          disabled={exporting || !draftId}
          className="px-5 py-3 rounded-[8px] border border-primary text-primary font-medium hover:bg-primary/5 transition disabled:opacity-50"
        >
          Word出力
        </button>
        <button
          type="button"
          onClick={onNext}
          className="ml-auto px-6 py-3 rounded-[8px] bg-primary text-white font-semibold hover:bg-[var(--hc-primary-hover)] transition"
        >
          完了
        </button>
      </div>
    </div>
  );
}
